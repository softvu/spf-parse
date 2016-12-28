'use strict';

function MechanismError(message, type) {
	this.name = 'MechanismError';
	this.message = message;
	this.type = type || 'warning';
	this.stack = (new Error()).stack;
}
MechanismError.prototype = Object.create(Error.prototype);
MechanismError.prototype.constructor = MechanismError;

module.exports = MechanismError;
