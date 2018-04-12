var assert = require('assert');
var verify = require('../verify.js');
describe('Verify',function() {
	it('should import',function() {
		assert.ok(verify);
	});

	describe('Broken Entities',function() {
		var broken = {
			i : {'a':0,'b':0,'c':0},
			o : {'a':0,'b':0,'c':0},
			run : function() {
				console.log('example');
			}
		};
	
		it('should fail without name',function() {
			assert.ok(!verify(broken),broken.name);
		});
	});
});
