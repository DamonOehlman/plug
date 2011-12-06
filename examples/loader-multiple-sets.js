var path = require('path'),
    plugger = require('../').create('Bob', 36);

// handle plugin connection
plugger.on('connect', function(pluginName, pluginData, modulePath) {
    console.log('loaded plugin "' + pluginName + '", with data: ', pluginData);
});

plugger.on('drop', function(pluginName, plugin) {
    console.log('dropped plugin: ' + pluginName + ', sport = ' + plugin.data.sport);
});

plugger.find(path.resolve(__dirname, 'plugins/a'));
plugger.find(path.resolve(__dirname, 'plugins/b'));