/* jshint node: true */
'use strict';

var debug = require('debug')('plug');
var path = require('path');
var fs = require('fs');
var events = require('events');
var util = require('util');

var Plugger = exports.Plugger = function() {
  if (! (this instanceof Plugger)) {
    var p = new Plugger();
    p.apply(p, arguments);

    return p;
  }

  this.activePlugins = {};
  this.args = Array.prototype.slice.call(arguments, 0);
}; // PluginLoader

util.inherits(Plugger, events.EventEmitter);

Plugger.prototype.activate = function(pluginName, plugin, modulePath, data) {
  // update the active plugins
  this.activePlugins[pluginName] = {
    data: data,
    module: plugin,
    path: modulePath
  };

  // emit the connect event
  debug('!! CONNECT: plugin "' + pluginName + '" load fired callback, completed');
  this.emit('connect', pluginName, data || {}, modulePath);
};

Plugger.prototype.drop = function(pluginName) {
  var activePlugin = this.activePlugins[pluginName];
  var loader = this;
  var dropActions = [];
      
  // if the plugin is already loaded, then drop it
  debug('check if drop required for plugin: ' + pluginName);
  if (activePlugin) {
    debug('!! DROP: active plugin found for "' + pluginName + '", attempting drop');
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
  var pluginName = path.basename(modulePath, '.js');
  var plugin;
  var connectArgs = this.args;
  var loader = this;
  var haveCallback;
  var connectResult;
      
  // drop the existing plugin if it exists
  loader.drop(pluginName, plugin);

  debug('loading plugin "' + pluginName + '" from: ' + modulePath);
  require.cache[modulePath] = undefined;

  try {
    // load the plugin
    plugin = require(modulePath);
  }
  catch (e) {
    loader.emit('error', e);
  }
  
  if (plugin && plugin.connect) {
    haveCallback = plugin.connect.length > this.args.length;
    
    // if the function has a callback parameter, then append the callback arg
    if (haveCallback) {
      // add the callback to the connect args
      connectArgs = this.args.concat(function(pluginData) {
        loader.activate(pluginName, plugin, modulePath, pluginData || connectResult);
      });
    } 
    
    // call the connect method
    connectResult = plugin.connect.apply(null, connectArgs);

    // if we didn't have a callback, then emit the connect event
    if (! haveCallback) {
      loader.activate(pluginName, plugin, modulePath, connectResult);
    }
  }
};