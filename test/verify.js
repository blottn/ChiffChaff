var assert = require('assert');
var verify = require('../verify.js');
describe('Verify',function() {
	it('Should import',function() {
		assert.ok(verify);
	});

	describe('Broken Entities',function() {
		var broken_name = {
			type : 'broken',
			i : {'a':0,'b':0,'c':0},
			o : {'a':0,'b':0,'c':0},
			run : function() {
				console.log('example');
			}
		};
		var broken_type = {
			name : 'broken',
			i : {'a':0,'b':0,'c':0},
			o : {'a':0,'b':0,'c':0},
			run : function() {
				console.log('example');
			}
		};
		var broken_i = {
			name : 'broken',
			type : 'broken',
			o : {'a':0,'b':0,'c':0},
			run : function() {
				console.log('example');
			}
		}
		var broken_o = {
			name : 'broken',
			type : 'broken',
			i : {'a':0,'b':0,'c':0},
			run : function() {
				console.log('example');
			}
		}
		it('Should fail without name',function() {
			assert.ok(!verify(broken_name),'Should fail without name');
			broken_name['name'] = ['test'];
			assert.ok(!verify(broken_name),'Should fail with incorrect type of name');
		});
		it('Should fail without type',function() {
			assert.ok(!verify(broken_type),'Should fail without type');
		});
		it('Should fail without i',function() {
			assert.ok(!verify(broken_i),'Should fail without i');
		});
		it('Should fail without o',function() {
			assert.ok(!verify(broken_o),'Should fail without o');
		});
	});
});
