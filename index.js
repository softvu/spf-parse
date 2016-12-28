'use strict';

const QUALIFIERS = {
	'+': 'Pass',
	'-': 'Fail',
	'~': 'SoftFail',
	'?': 'Neutral'
};
const MECHANISMS = {
	all: { description: 'Always matches. It goes at the end of your record' },
	ip4: { description: 'Match if IP is in the given range' },
	ip6: {},
	a: {
		description: "Match if IP has a DNS 'A' record in given domain"
	},
	mx: {},
	ptr: {
		// ptr
		// ptr:<domain>
	},
	exists: {
		validate: r => {} // Domain name
	},
	include: {
		description: "The specified domain is searched for an 'allow'",
		validate: r => {} // Domain name
	},
};
const versionTest = /^v=spf1/;
const mechanismRegex = /(.)?(.+)/;

// TODO: Include warning message in the return object
// SPF strings should always either use an "all" mechanism
//   or a "redirect" modifier to explicitly terminate processing.

// Prefix
// Type
// Value
// PrefixDesc
// Description

module.exports = record => {
	// Remove whitespace
	record = record.trim();

	if (!versionTest.test(record)) {
		throw new Exception('No valid version');
	}

	let mechanisms = record.split(/\s+/);

	let records = [];
	let messages = [];
	mechanisms.forEach(m => {
		let parts = m.match(mechanismRegex);
	});

	// TODO: check for duplicate mechanisms, which is a warning

	// See if there's an "all" or "redirect" at the end of the policy
	const lastMech = mechanisms[mechanisms.length - 1].type;
	if (lastMech.type !== 'all' && lastMech !== 'redirect') {
		messages.push({ type: 'warning', message: 'SPF strings should always either use an "all" mechanism or a "redirect" modifier to explicitly terminate processing.' });
	}

	//
	// One or more mechanisms were found after the "all" mechanism. These mechanisms will be ignored.
};
