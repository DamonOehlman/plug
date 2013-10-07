/* jshint node: true */
'use strict';

/**
  # plug

  Plug is a very simple plugin system for Node.js.  It has minimal
  dependencies and is should make loading plugins a very simple affair.

  ## Design Principles

  - Plugins are node modules that export a `connect` and `drop` function.
  - Each `Plugger` manages a list of active plugins, which are unique by name.
  - In the event that a plugin with the same name as an existing plugin is
    loaded into a Plugger scope, the old plugin is __dropped__ before the
    new plugin is __connected__.

  ## Plugin Connection

  When a new plugin is found, the `connect` function for the plugin is
  called with arguments that were passed when a new `Plugger` instance was
  created.  This sounds a little confusing at first, but makes plug quite
  powerful.

  In the following example, for instance, a Plugger is created taking a
  name and age argument:

  <<< examples/simple-loader.js

  When plugins are later connected, these arguments are passed through to
  the plugin's connect function along with a callback.  The callback is
  responsible for returning _pluginData_ to the plugger, and all of this
  information is passed through when a `connect` event is emitted:

  <<< examples/plugins/a/first.js

  Running, the above example yields the following output:

  ```
  I belong to Bob
  loaded plugin "first", with data:  { sport: 'Fishing' }
  ```

  ## Plugin Drop (or Disconnection)

  To be completed.

  ### Using Drop Actions

  To be completed.

  ## Other Node Plugin Systems

  - [haba](https://github.com/crcn/haba)
  - [broadway](https://github.com/flatiron/broadway)
**/

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