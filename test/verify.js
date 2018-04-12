var assert = require('assert');
var verify = require('../verify.js');
describe('Verify',function() {
	it('Should import',function() {
		assert.ok(verify);
	});

	describe('Broken Entities',function() {
		describe('Name',function() {
			var broken_name = {
				type : 'broken',
				i : {'a':0,'b':0,'c':0},
				o : {'a':0,'b':0,'c':0},
				run : function() {
					console.log('example');
				}
			};
			it('Should fail without name',function() {
				assert.ok(!verify(broken_name),'Passed without name');
			});
			it('Should fail when not a string',function() {
				broken_name['name'] = ['test'];
				assert.ok(!verify(broken_name),'Passed with name as array');
			});
		});
		describe('Type',function() {
			
			var broken_type = {
				name : 'broken',
				i : {'a':0,'b':0,'c':0},
				o : {'a':0,'b':0,'c':0},
				run : function() {
					console.log('example');
				}
			};
			it('Should fail without type',function() {
				assert.ok(!verify(broken_type),'Passed without type');
			});
		});
		
		describe('Input',function() {
			var broken_i = {
				name : 'broken',
				type : 'broken',
				o : {'a':0,'b':0,'c':0},
				run : function() {
					console.log('example');
				}
			}
			it('Should fail without i',function() {
				assert.ok(!verify(broken_i),'Passed without i');
			});
		});
		
		describe('Output',function() {
			var broken_o = {
				name : 'broken',
				type : 'broken',
				i : {'a':0,'b':0,'c':0},
				run : function() {
					console.log('example');
				}
			}
			it('Should fail without o',function() {
				assert.ok(!verify(broken_o),'Passed without o');
			});
		});
	});
});
