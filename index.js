'use strict';

const MechanismError = require('./mechanismerror');
const MECHANISMS = require('./mechanisms');

const QUALIFIERS = {
	'+': 'Pass',
	'-': 'Fail',
	'~': 'SoftFail',
	'?': 'Neutral'
};

const versionRegex = /^v=spf1/;
const mechanismRegex = /(\+|-|~|\?)?(.+)/;

// TODO: Include warning message in the return object
// SPF strings should always either use an "all" mechanism
//   or a "redirect" modifier to explicitly terminate processing.

// Prefix
// Type
// Value
// PrefixDesc
// Description

function parseTerm(term, messages) {
	// Match up the prospective mechanism against the mechanism regex
	let parts = term.match(mechanismRegex);

	let record = {};

	// It matched! Let's try to see which specific mechanism type it matches
	if (parts !== null) {
		// Break up the parts into their pieces
		let qualifier = parts[1];
		let mechanism = parts[2];

		// Check qualifier
		if (qualifier) {
			if (QUALIFIERS[qualifier]) {
				record.prefix = qualifier;
				record.prefixdesc = QUALIFIERS[qualifier];
			}
			else {
				messages.push({
					message: `Unknown qualifier: '${qualifier}' in term '${term}'`,
					type: 'error'
				});

				return;
			}
		}
		else if (versionRegex.test(mechanism)) {
			record.prefix = 'v';
		}
		else {
			// Default to "pass" qualifier
			record.prefix = '+';
			record.prefixdesc = QUALIFIERS['+'];
		}

		for (let name in MECHANISMS) {
			if (Object.prototype.hasOwnProperty.call(MECHANISMS, name)) {
				const settings = MECHANISMS[name];

				// Matches mechanism spec
				if (settings.pattern.test(mechanism)) {
					record.type = name;
					record.description = settings.description;

					if (settings.validate) {
						try {
							let value = settings.validate.call(settings, mechanism);
							record.value = value;
						}
						catch (err) {
							if (err instanceof MechanismError) {
								// Error validating mechanism
								messages.push({
									message: err.message,
									type: err.type
								});
								break;
							}
							else {
								throw err;
							}
						}
					}

					break;
				}
			}
		}
	}
	else {
		// Term didn't match mechanism regex
		messages.push({
			message: `Unknown term "${term}"`,
			type: 'error'
		});

		return;
	}

	return record;
}

function parse(record) {
	// Remove whitespace
	record = record.trim();

	let records = {
		mechanisms: [],
		messages: []
	};

	if (!versionRegex.test(record)) {
		// throw new Error();
		records.messages.push({
			message: 'No valid version found, record must start with \'v=spf1\'',
			type: 'error'
		});

		return records;
	}

	let terms = record.split(/\s+/);

	for (let term of terms) {
		let mechanism = parseTerm(term, records.messages);

		if (mechanism) {
			records.mechanisms.push(mechanism);
		}
	}

	// TODO: check for duplicate mechanisms, which is a warning

	// See if there's an "all" or "redirect" at the end of the policy
	if (records.length > 0) {
		let lastMech = records[records.length - 1];
		if (lastMech.type !== 'all' && lastMech !== 'redirect') {
			records.messages.push({
				type: 'warning',
				message: 'SPF strings should always either use an "all" mechanism or a "redirect" modifier to explicitly terminate processing.'
			});
		}
	}

	// TODO: check for this error below
	// One or more mechanisms were found after the "all" mechanism. These mechanisms will be ignored.records.

	if (!Object.keys(records.messages).length > 0) {
		delete records.messages;
	}

	return records;
}

parse.parseTerm = parseTerm;

module.exports = parse;
