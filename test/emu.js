const assert = require('assert');
const verify = require('../verify.js');
const emu = require('../emu.js');

describe('Emulation',function() {
	it('Should import',function() {
		assert.ok(verify,'Failed to import verify');
		assert.ok(emu,'Failed to import emu');
	});
});
