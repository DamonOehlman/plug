var path = require('path');
var plug = require('..');
var plugins = plug('Bob', 36);

// handle plugin connection
plugins.on('connect', function(pluginName, pluginData, modulePath) {
  console.log('loaded plugin "' + pluginName + '", with data: ', pluginData);
});

plugins.find(path.resolve(__dirname, 'plugins/b'));