const assert = require('assert');
const verify = require('../verify.js');
const reserved = require('../reserved.js');

const example_types = [{}, 123, 'mystring'];
const example_keys = [123,'mystring'];

describe('Verify',function() {
	it('Should import',function() {
		assert.ok(verify);
	});

	describe('Broken Entities',function() {
		describe('Name',function() {
			let broken_name = {
				type : 'broken',
				i : {'a':0,'b':0,'c':0},
				o : {'a':0,'b':0,'c':0},
				op : {
					type : 'func',
					data : function() {
						console.log('test');
					}
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
			let broken_type = {
				name : 'broken',
				i : {'a':0,'b':0,'c':0},
				o : {'a':0,'b':0,'c':0},
				op : {
					type : 'func',
					data : function() {
						console.log('test');
					}
				}
			};
			it('Should fail without type',function() {
				assert.ok(!verify(broken_type),'Passed without type');
			});
			it('Should fail when type isn\'t string', function() {
				checkTypeFailures(verify,broken_type,'type','string');
			});
			it('Should fail when type is a reserved type', function() {
				for (let i in reserved) {
					broken_type['type'] = reserved[i];
					assert.ok(!verify(broken_type),'Passed with type set to reserved value: ' + reserved[i]);
				}
			});
		});
		
		testIOField('Input');
		testIOField('Output');
		
		describe('Operation',function() {
			let broken = {
				name : 'broken',
				type : 'broken',
				i : {'a':0,'b':0,'c':0},
				o : {'x':0,'y':0,'z':0},
			};
			it('Should fail without an op field',function() {
				assert.ok(!verify(broken),'Passed without op field');
			});
			it('Should fail when type isn\'t a string', function() {	// doesn't work because it passes the wrong object to verify
				broken.op = {
					type : {},
					data : function() {
						console.log('tick');
					}
				};
				assert.ok(!verify(broken), 'Passed with type as object');
				broken.op.type = 123;
				assert.ok(!verify(broken), 'Passed with type as number');
				broken.op.type = 'func';
				assert.ok(verify(broken), 'Failed with type as string');
			});
			it('Should expect correct data values for types',testOps);
		});
		describe('Children',function() {
			it('Should fail with children not as object', function() {
				let entity = {
					name : 'test',
					type : 'test',
					i : {'a':0, 'b':0},
					o : {'x':0},
					op : {
						type : 'map',
						data : {
							'x':'a&b'
						}
					}
				};
				checkTypeFailures(verify,entity,'children','object');
			});
			it('Should fail without an output', function() {	// unsure if I definitely want to force output
				let entity = {
					name : 'test',
					type : 'test',
					i : {'a':0, 'b':0},
					o : {'x':0},
					children : {
						'c' : {
							type : 'newand',
							i : {'a': 0,'b':0}
						}
					},
					op : {
						type : 'map',
						data : {
							'x':'a&b'
						}
					}
				};

				assert.ok(!verify(entity),'Passed without output');
				entity.children.c['o'] = {'x':0};
				assert.ok(verify(entity),'Failed with output and valid object');
			});
			it('Should fail without a type', function() {

			});
		});
	});
});

function testOps() {
	let broken = {
		name : 'name',
		type : 'type',
		i : {'a':0,'b':0,'c':0},
		o : {'x':0,'y':0,'z':0},
		op: {
			type : 'func',
			data : function() {
				console.log('test');
			}
		}
	};

	assert.ok(verify(broken),'Failed with function op');

	broken['op'] = {
		type : 'map',
		data : ['x=a','y=b','z=c']
	}
	assert.ok(verify(broken),'Failed with map op');
}

function testIOField(field) {
	let shorthand = '';
	let other = '';
	if (field === 'Input') {
		shorthand = 'i';
		other = 'o';
	}
	else {
		shorthand = 'o';
		other = 'i';
	}
	describe(field,function() {
		let broken = {
			name : 'broken',
			type : 'broken',
			op : {
				type : 'func',
				data : function() {
					console.log('test');
				}
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
	for (let i in example_keys) {
		for (let j in example_types) {
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
	for (let i in example_types) {
		object[key] = example_types[i];
		if(!(typeof example_types[i] === type)) {
			assert.ok(!f(object),'Passed with ' + key + ' set to invalid type: ' + (typeof example_types[i]));
		}
		else {
			assert.ok(f(object),'Failed with ' + key + ' set to valid type: ' + (typeof example_types[i]));
		}
	}
}