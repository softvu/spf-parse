'use strict';

const MechanismError = require('./mechanismerror');
const MECHANISMS = require('./mechanisms');
const PREFIXES = require('./prefixes');

const versionRegex = /^v=spf1/i;
const mechanismRegex = /(\+|-|~|\?)?(.+)/i;

// * Values that will be set for every mechanism:
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
		let prefix = parts[1];
		let mechanism = parts[2];

		// Check qualifier
		if (prefix) {
			record.prefix = prefix;
			record.prefixdesc = PREFIXES[prefix];
		}
		else if (versionRegex.test(mechanism)) {
			record.prefix = 'v';
		}
		else {
			// Default to "pass" qualifier
			record.prefix = '+';
			record.prefixdesc = PREFIXES['+'];
		}

		let found = false;
		for (let name in MECHANISMS) {
			if (Object.prototype.hasOwnProperty.call(MECHANISMS, name)) {
				const settings = MECHANISMS[name];

				// Matches mechanism spec
				if (settings.pattern.test(mechanism)) {
					found = true;

					record.type = name;
					record.description = settings.description;

					if (settings.validate) {
						try {
							let value = settings.validate.call(settings, mechanism);

							if (typeof value !== 'undefined' && value !== null) {
								record.value = value;
							}
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
							// else {
							// 	throw err;
							// }
						}
					}

					break;
				}
			}
		}

		if (!found) {
			messages.push({
				message: `Unknown standalone term '${mechanism}'`,
				type: 'error'
			});
		}
	}
	// NOTE: I don't think this branch could ever be hit...
	// else {
	// 	// Term didn't match mechanism regex
	// 	messages.push({
	// 		message: `Unknown term "${term}"`,
	// 		type: 'error'
	// 	});
	//
	// 	return;
	// }

	return record;
}

function parse(record) {
	// Remove whitespace
	record = record.trim();

	let records = {
		mechanisms: [],
		messages: [],
		// Valid flag will be changed at end of function
		valid: false
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

	// Give an error for duplicate Modifiers
	let duplicateMods = terms
												.filter(x => new RegExp('=').test(x))
												.map(x => x.match(/^(.*?)=/)[1])
												.filter((x, i, arr) => {
													return arr.includes(x, i + 1);
												});

	if (duplicateMods && duplicateMods.length > 0) {
		records.messages.push({
			type: 'error',
			message: `Modifiers like "${duplicateMods[0]}" may appear only once in an SPF string`
		});
		return records;
	}

	// Give warning for duplicate mechanisms
	let duplicateMechs = terms
												.map(x => x.replace(/^(\+|-|~|\?)/, ''))
												.filter((x, i, arr) => {
													return arr.includes(x, i + 1);
												});

	if (duplicateMechs && duplicateMechs.length > 0) {
		records.messages.push({
			type: 'warning',
			message: 'One or more duplicate mechanisms were found in the policy'
		});
	}

	for (let term of terms) {
		let mechanism = parseTerm(term, records.messages);

		if (mechanism) {
			records.mechanisms.push(mechanism);
		}
	}

	// See if there's an "all" or "redirect" at the end of the policy
	if (records.mechanisms.length > 0) {
		// More than one modifier like redirect or exp is invalid
		// if (records.mechanisms.filter(x => x.type === 'redirect').length > 1 || records.mechanisms.filter(x => x.type === 'exp').length > 1) {
		// 	records.messages.push({
		// 		type: 'error',
		// 		message: 'Modifiers like "redirect" and "exp" can only appear once in an SPF string'
		// 	});
		// 	return records;
		// }

		// let lastMech = records.mechanisms[records.mechanisms.length - 1];
		let redirectMech = records.mechanisms.find(x => x.type === 'redirect');
		let allMech = records.mechanisms.find(x => x.type === 'all');
		// if (lastMech.type !== 'all' && lastMech !== 'redirect') {
		if (!allMech && !redirectMech) {
			records.messages.push({
				type: 'warning',
				message: 'SPF strings should always either use an "all" mechanism or a "redirect" modifier to explicitly terminate processing.'
			});
		}

		// Give a warning if "all" is not last mechanism in policy
		let allIdx = records.mechanisms.findIndex(x => x.type === 'all');
		if (allIdx > -1) {
			if (allIdx < records.mechanisms.length - 1) {
				records.messages.push({
					type: 'warning',
					message: 'One or more mechanisms were found after the "all" mechanism. These mechanisms will be ignored'
				});
			}
		}

		// Give a warning if there's a redirect modifier AND an "all" mechanism
		if (redirectMech && allMech) {
			records.messages.push({
				type: 'warning',
				message: 'The "redirect" modifier will not be used, because the SPF string contains an "all" mechanism. A "redirect" modifier is only used after all mechanisms fail to match, but "all" will always match'
			});
		}
	}

	// If there are no messages, delete the key from "records"
	if (!Object.keys(records.messages).length > 0) {
		delete records.messages;
	}

	records.valid = true;

	return records;
}

parse.parseTerm = parseTerm;

module.exports = parse;
