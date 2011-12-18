var debug = require('debug')('plug'),
    path = require('path'),
    fs = require('fs'),
    events = require('events'),
    util = require('util');

var Plugger = exports.Plugger = function() {
    this.activePlugins = {};
    this.args = Array.prototype.slice.call(arguments, 0);
}; // PluginLoader

util.inherits(Plugger, events.EventEmitter);

Plugger.prototype.drop = function(pluginName) {
    var activePlugin = this.activePlugins[pluginName],
        loader = this;
        
    // if the plugin is already loaded, then drop it
    if (activePlugin) {
        var dropActions = [];
        
        debug('active plugin found for "' + pluginName + '", attempting drop');
        if (activePlugin.module.drop) {
            dropActions = activePlugin.module.drop.apply(null, this.args) || [];
            if (! Array.isArray(dropActions)) {
                dropActions = [dropActions];
            }
        }
        
        // emit the drop event
        this.emit('drop', pluginName, activePlugin, dropActions);
        
        // iterate through the drop actions and fire events for each action
        dropActions.forEach(function(actionData) {
            if (actionData.action) {
                loader.emit(actionData.action, actionData);
            }
        });

        // delete the active plugin
        delete this.activePlugins[pluginName];
    }
};

Plugger.prototype.find = function(pluginPath) {
    var loader = this;
    
    debug('looking for app plugins in: ' + pluginPath);
    fs.readdir(pluginPath, function(err, files) {
        (files || []).forEach(function(file) {
            loader.load(path.join(pluginPath, file));
        });
    });
};

Plugger.prototype.load = function(modulePath) {
    // grab the base name of the plugin
    var pluginName = path.basename(modulePath, '.js'),
        plugin, connectArgs = this.args,
        loader = this;
    
    debug('loading plugin "' + pluginName + '" from: ' + modulePath);
    require.cache[modulePath] = undefined;

    try {
        // load the plugin
        plugin = require(modulePath);
    }
    catch (e) {
        // log plugin load error
    }
    
    if (plugin && plugin.connect) {
        var haveCallback = plugin.connect.length > this.args.length,
            connectResult;
        
        // if the function has a callback parameter, then append the callback arg
        if (haveCallback) {
            // add the callback to the connect args
            connectArgs = this.args.concat(function(pluginData) {
                // update the active plugins
                loader.activePlugins[pluginName] = {
                    data: pluginData,
                    module: plugin,
                    path: modulePath
                };

                // emit the connect event
                loader.emit('connect', pluginName, pluginData || connectResult || {}, modulePath);
            });
        } 
        
        // drop the existing plugin if it exists
        loader.drop(pluginName, plugin);

        // call the connect method
        connectResult = plugin.connect.apply(null, connectArgs);

        // if we didn't have a callback, then emit the connect event
        if (! haveCallback) {
            loader.emit('connect', pluginName, connectResult || {}, modulePath);
        }
    }
};

exports.create = function() {
    // create the new plugger
    var instance = new Plugger();
    
    // apply the constructor to pass through the arguments
    Plugger.apply(instance, Array.prototype.slice.call(arguments, 0));
    
    // return the new instance
    return instance;
};