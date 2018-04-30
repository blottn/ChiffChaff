const assert = require('assert');
const verify = require('../verify.js');
const emu = require('../emu.js');

describe('Emulation',function() {
	it('Should import',function() {
		assert.ok(verify,'Failed to import verify');
		assert.ok(emu,'Failed to import emu');
	});
	describe('Map steps',function() {
		let ent = {
			name : 'name',
			type : 'test',
			i : {'a':1,'b':0},
			o : {'x':0},
			op : {
				type : 'map',
				data : {'x':'a&b'}
			}
		};
		let conf = {
			op : '|',
			desc : 'a|b',
			confs : [
				{
					i : {
						a : 0,
						b : 0
					},
					o : {
						x : 0
					},
				},
				{
					i : {
						a : 0,
						b : 1
					},
					o : {
						x : 1
					},
				},
				{
					i : {
						a : 1,
						b : 0
					},
					o : {
						x : 1
					},
				},
				{
					i : {
						a : 1,
						b : 1
					},
					o : {
						x : 1
					},
				}
			]
		};
		run_for_op(conf,ent);

		conf = {
			op : '^',
			desc : 'a^b',
			confs : [
				{
					i : {
						a : 0,
						b : 0
					},
					o : {
						x : 0
					},
				},
				{
					i : {
						a : 0,
						b : 1
					},
					o : {
						x : 1
					},
				},
				{
					i : {
						a : 1,
						b : 0
					},
					o : {
						x : 1
					},
				},
				{
					i : {
						a : 1,
						b : 1
					},
					o : {
						x : 0
					},
				}
			]
		};
		run_for_op(conf,ent); 

		conf = {
			op : '&',
			desc : 'a&b',
			confs : [
				{
					i : {
						a : 0,
						b : 0
					},
					o : {
						x : 0
					},
				},
				{
					i : {
						a : 0,
						b : 1
					},
					o : {
						x : 0
					},
				},
				{
					i : {
						a : 1,
						b : 0
					},
					o : {
						x : 0
					},
				},
				{
					i : {
						a : 1,
						b : 1
					},
					o : {
						x : 1
					},
				}
			]
		};
		run_for_op(conf,ent); 
	});
});

function run_for_op(op,ent) {
	it ('Should work for ' + op.op, function() {
		ent.op.data.x = op.desc;
		for (let i in op.confs) {
			for (let j in op.confs[i].i) {
				ent.i[j] = op.confs[i].i[j];
			}
			emu.step(ent);
			//assert for all outputs
			for (let j in op.confs[i].o) {
				assert.ok(ent.o[j] === op.confs[i].o[j],'Failed ' + op.desc);
			}
		}
	});
};
