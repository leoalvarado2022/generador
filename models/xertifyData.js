"use strict";

class xertifyData {
	constructor(data){
	 	this.data = data;
	}

	get(name) {
    	return this.data[name];
	}

	set(name,value) {
	  this.data[name] = value;
	}
}

module.exports = xertifyData;