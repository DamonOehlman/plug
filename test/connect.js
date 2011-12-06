var assert = require('assert'),
    Plugger = require('../').Plugger,
    _plugger;

describe('load plugins in a directory', function() {
    it('should be able to create a new plugger', function() {
        _plugger = new Plugger();
    });
});