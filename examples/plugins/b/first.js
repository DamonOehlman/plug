exports.connect = function(name, age, callback) {
	console.log('I am the property of ' + name);
	callback({
		sport: 'Tennis'
	});
};