function verify(obj) {
	if ("name" in obj && !typeof obj.name === "string") {	// check name field
		return false;
	}

	if  (  !"i" in obj 
		|| !"o" in obj 
		|| !obj.i instanceof Array 
		|| !obj.o instanceof Array) {	// check i and o fields
		return false;
	}
	
	return true;
}

module.exports = verify;
