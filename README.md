# plug - lightweight and simple plugin system

Plug is a very simple plugin system for Node.js.  It has minimal dependencies and is should make loading plugins a very simple affair.

## Design Principles

- Plugins are node modules that export a `connect` and `drop` function.
- Each `Plugger` manages a list of active plugins, which are unique by name.
- In the event that a plugin with the same name as an existing plugin is loaded into a Plugger scope, the old plugin is __dropped__ if the new plugin is successfully __connected__.

## Installing

The simplest way to install plug is via npm:

```
npm install plug
```

## Plugin Connection

When a new plugin is found, the `connect` function for the plugin is called with arguments that were passed when a new `Plugger` instance was created.  This sounds a little confusing at first, but makes plug quite powerful.

In the following example, for instance, a Plugger is created taking a name and age argument:

`examples/simple-loader.js`:

```js
var path = require('path'),
    plugger = require('plug').create('Bob', 36);

// handle plugin connection
plugger.on('connect', function(pluginName, pluginData, modulePath) {
    console.log('loaded plugin "' + pluginName + '", with data: ', pluginData);
});

plugger.find(path.resolve(__dirname, 'plugins/a'));
```

When plugins are later connected, these arguments are passed through to the plugin's connect function along with a callback.  The callback is responsible for returning _pluginData_ to the plugger, and all of this information is passed through when a `connect` event is emitted:

`plugins/a/first.js`:

```
exports.connect = function(name, age, callback) {
	console.log('I belong to ' + name);
	callback({
		sport: 'Fishing'
	});
});
```

Running, the above example yields the following output:

```
I belong to Bob
loaded plugin "first", with data:  { sport: 'Fishing' }
```

## Plugin Drop (or Disconnection)

To be completed.

## Other Node Plugin Systems

- [haba](https://github.com/crcn/haba)
- [broadway](https://github.com/flatiron/broadway)