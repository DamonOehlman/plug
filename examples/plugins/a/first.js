exports.connect = function(name, age, callback) {
	console.log('I belong to ' + name);
	callback(null, {
		sport: 'Fishing'
	});
};