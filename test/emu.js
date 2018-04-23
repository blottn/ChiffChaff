const assert = require('assert');
const verify = require('../verify.js');
const emu = require('../emu.js');

describe('Emulation',function() {
	it('Should import',function() {
		assert.ok(verify,'Failed to import verify');
		assert.ok(emu,'Failed to import emu');
	});
	describe('Map steps',function() {
		it('Should work for &',function() {
			var ent = {
				name : 'name',
				type : 'test',
				i : {'a':1,'b':0},
				o : {'x':0},
				op : {
					type : 'map',
					data : {'x':'a&b'}
				}
			}
			emu.step(ent);
			assert.ok(ent.o.x === 0, '0 & 1 should be 0');

			ent.i.b = 1;
			emu.step(ent);
			assert.ok(ent.o.x === 1, '1 & 1 should be 1');
		});
	});
});
