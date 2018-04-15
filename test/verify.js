const assert = require('assert');
const verify = require('../verify.js');
const reserved = require('../reserved.js');

const example_types = [{}, 123, 'mystring',[]];
const example_keys = [123,'mystring'];
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
				checkTypeFailures(verify,broken_name,'name','string');
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
				checkTypeFailures(verify,broken_type,'type','string');
			});
			it('Should fail when type is a reserved type', function() {
				for (var i in reserved) {
					broken_type['type'] = reserved[i];
					assert.ok(!verify(broken_type),'Passed with type set to reserved value: ' + reserved[i]);
				}
			});
		});
		
		testIOField('Input');
		testIOField('Output');

	});
});

function testIOField(field) {
	var field = '';
	var other = '';
	if (field === 'Input') {
		shorthand = 'i';
		other = 'o';
	}
	else {
		shorthand = 'o';
		other = 'i';
	}

	describe(field,function() {
		var broken = {
			name : 'broken',
			type : 'broken',
			run : function() {
				console.log('example');
			}
		};
		broken[other] = {'a':0,'b':0,'c':0};
		it('Should fail without ' + shorthand + ' field',function() {
			assert.ok(!verify(broken),'Passed without ' + shorthand + ' field');
		});
		it('Should fail with incorrect type of ' + shorthand + ' field',function() {
			checkTypeFailures(verify,broken,shorthand,'object');
		});
		it('Should have ' + shorthand + ' object internal fields of the form String : Int',function() {
			checkObjectInternalTypes(verify,broken,shorthand,'string','number');
		});
	});
}

function checkObjectInternalTypes(f,object,field,type_a,type_b) {
	for (var i in example_keys) {
		for (var j in example_types) {
			object[field][i] = j;
			if ((typeof i === type_a) && (typeof j === type_b)) {
				assert.ok(f(object), 'Failed with key: ' + i + ' and value: ' + j);
			}
			else {
				assert.ok(!f(object), 'Passed with key: ' + i + ' and value: ' + j);
			}
		}
		object[field] = {};	//clear it
	}
}

function checkTypeFailures(f,object,key,type) {
	for (var i in example_types) {
		object[key] = example_types[i];
		if(!(typeof example_types[i] === type)) {
			assert.ok(!f(object),'Passed with ' + key + ' set to invalid type: ' + (typeof example_types[i]));
		}
		else {
			assert.ok(f(object),'Failed with ' + key + ' set to invalid type: ' + (typeof example_types[i]));
		}
	}
}
