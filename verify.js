const reserved = require('./reserved.js');

function verify(obj) {
	if (("name" in obj && !(typeof obj.name === "string")) || !("name" in obj)) {	// check name field
		return false;
	}

	if (("type" in obj && !(typeof obj.type === "string")) || !("type" in obj) || reserved.includes(obj.type)) {	// check type field

		return false;
	}

	if  (  !("i" in obj)
		|| !("o" in obj)
		|| !(obj.i instanceof Object) 
		|| !(obj.o instanceof Object)) {	// check i and o fields
		return false;
	}
	
	if (!("op" in obj)
		|| !(obj.op instanceof Object)
		|| !("type" in obj.op)
		|| !(typeof obj.op.type === "string")
		|| !("data" in obj.op)) {
		return false;
	}
	return true;
}

module.exports = verify;
