"use strict";

class Code {
	constructor(code) {
		this.code = code;
		this.beforecode = this.code.substr(0, (this.code.length-3) );
	}
	
	getNum() {
	    return parseInt(this.code.substr( (this.code.length-3) ));
	}

	get() {
		return this.code;
	}

	getNext() {
		const _num = this.getNum() + 1;
		let zero = parseInt(_num.toString().length);
		this.code = this.beforecode + (('000'+_num).slice(zero));

		return this;
	}
}

module.exports = Code;