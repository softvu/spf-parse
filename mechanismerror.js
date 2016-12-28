function MechanismError(message, type) {
	this.message = message;
	this.type = type || 'warning';
}
MechanismError.prototype = Error.prototype;

module.exports = MechanismError;
