const operators=['&','|','!','(',')'];

function step(entity) {	// assumes the entity it is passed is verified by the verifier
	if (entity.op.type === 'map') {
		let states = {};
		for (let i in entity.i) {
			states[i] = entity.i[i];
		}
		return map_step(entity, states);
	}
	return entity;
}

function map_step(entity, states) {
	for (let out in entity.op.data) {
		entity.o[out] = evaluate(entity,entity.op.data[out],states);
	}
	return entity;
}

function evaluate(entity, logic, states) {
	eval(loc('states'));
	return eval(logic);
}
module.exports = {
	step : step
};
