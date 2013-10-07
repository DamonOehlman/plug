var path = require('path');
var plugger = require('../').create('Bob', 36);

// handle plugin connection
plugger.on('connect', function(pluginName, pluginData, modulePath) {
  console.log('loaded plugin "' + pluginName + '", with data: ', pluginData);
});

plugger.find(path.resolve(__dirname, 'plugins/b'));