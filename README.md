# plug

Plug is a very simple plugin system for Node.js.  It has minimal
dependencies and is should make loading plugins a very simple affair.


[![NPM](https://nodei.co/npm/plug.png)](https://nodei.co/npm/plug/)

[![Build Status](https://travis-ci.org/DamonOehlman/plug.png?branch=master)](https://travis-ci.org/DamonOehlman/plug)

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

```js
var path = require('path');
var plugger = require('plug').create('Bob', 36);

// handle plugin connection
plugger.on('connect', function(pluginName, pluginData, modulePath) {
  console.log('loaded plugin "' + pluginName + '", with data: ', pluginData);
});

plugger.find(path.resolve(__dirname, 'plugins/b'));
```

When plugins are later connected, these arguments are passed through to
the plugin's connect function along with a callback.  The callback is
responsible for returning _pluginData_ to the plugger, and all of this
information is passed through when a `connect` event is emitted:

```js
exports.connect = function(name, age, callback) {
	console.log('I belong to ' + name);
	callback({
		sport: 'Fishing'
	});
};
```

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

## License(s)

### MIT

Copyright (c) 2013 Damon Oehlman <damon.oehlman@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
