const assert = require('assert');
const verify = require('../verify.js');
const reserved = require('../reserved.js');

const example_types = [{}, 123, 'mystring',[]];

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
			it('Should fail when name not a string',function() {
				for (var i in example_types) {
					broken_name['name'] = example_types[i];
					assert.ok(!verify(broken_name),'Passed with name as type: ' + (typeof example_types[i]));
				}
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
			it('Should fail when type isn\'t string', function() {
				for (var i in example_types) {
					broken_type['type'] = example_types[i];
					assert.ok(!verify(broken_type),'Passed with type as ' + (typeof example_types[i]));
				}
				assert.ok(!verify(broken_type),'Passed with type as array');
			});
			it('Should fail when type is a reserved type', function() {
				for (var i in reserved) {
					broken_type['type'] = reserved[i];
					assert.ok(!verify(broken_type),'Passed with type set to reserved value: ' + reserved[i]);
				}
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
			it('Should fail without i field',function() {
				assert.ok(!verify(broken_i),'Passed without i field');
			});
		});
		
		describe('Output',function() {
			var broken_o = {
				name : 'broken',
				type : 'broken',
				i : {'a':0,'b':0,'c':0,'c':1},
				run : function() {
					console.log('example');
				}
			};
			it('Should fail without o field',function() {
				assert.ok(!verify(broken_o),'Passed without o field');
			});
			it('Should fail with incorrect type of o field',function() {
/*				for (var i in example_types) {
					if (!(typeof example_types[i] === "object")) {
						broken_o['o'] = example_types[i];
						assert.ok(!verify(broken_o),'Passed with o set to invalid type: ' + (typeof example_types[i]));
					}
				}*/
				checkTypeFailures(verify,broken_o,'o','object');
			});
		});
	});
});

function checkTypeFailures(f,object,key,type) {
	for (var i in example_types) {
		if(!(typeof example_types[i] === type)) {
			object[key] = example_types[i];
			assert.ok(!f(object),'Passed with ' + key + ' set to invalid type: ' + (typeof example_types[i]));
		}
	}
}
