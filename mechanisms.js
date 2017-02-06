'use strict';

/* eslint no-useless-escape: 0 */

const tld = require('tldjs');
const ipaddr = require('ipaddr.js');
const MechanismError = require('./mechanismerror');

// TODO: need to validate CIDRs and IPs in the patterns

function domainPrefixCheck(name, pattern, term) {
	let parts = term.match(pattern);
	let value = parts[1];

	if (!value) {
		return null;
	}

	if (value === ':' || value === '/') {
		throw new MechanismError(`Blank argument for the '${name}' mechanism`, 'error');
	}

	// Value starts with ':' so it's a domain
	if (/^:/.test(value)) {
		value = value.replace(/^:/, '');

		if (!tld.isValid(value)) {
			throw new MechanismError(`Invalid domain for the '${name}' mechanism: '${value}'`, 'error');
		}
	}

	return value;
}

function domainCheckNullable(name, pattern, term) {
	return domainCheck(name, pattern, term, true);
}

function domainCheck(name, pattern, term, nullable) {
	let value = term.match(pattern)[1];

	if (!nullable && !value) {
		throw new MechanismError(`Missing mandatory argument for the '${name}' mechanism`, 'error');
	}

	if (value === ':' || value === '=') {
		throw new MechanismError(`Blank argument for the '${name}' mechanism`, 'error');
	}

	if (/^(:|\=)/.test(value)) {
		value = value.replace(/^(:|\=)/, '');

		if (!tld.isValid(value)) {
			throw new MechanismError(`Invalid domain for the '${name}' mechanism: '${value}'`, 'error');
		}
	}

	return value;
}

module.exports = {
	version: {
		description: 'The SPF record version',
		pattern: /^v=(.+)$/i,
		validate(r) {
			let version = r.match(this.pattern)[1];

			// NOTE: This test can never work since we force match it to spf1 in index.js
			// if (version !== 'spf1') {
			// 	throw new MechanismError(`Invalid version '${version}', must be 'spf1'`);
			// }

			return version;
		}
	},
	all: {
		description: 'Always matches. It goes at the end of your record',
		pattern: /^all$/i
	},
	ip4: {
		// ip4:<ip4-address>
		// ip4:<ip4-network>/<prefix-length>
		description: 'Match if IP is in the given range',
		pattern: /^ip4:(([\d\.]*)(\/\d+)?)$/i,
		validate(r) {
			let parts = r.match(this.pattern);
			let value = parts[1];
			let ip = parts[2];
			let cidr = parts[3];

			if (!value) {
				throw new MechanismError(`Missing or blank mandatory network specification for the 'ip4' mechanism.`, 'error');
			}

			if (!ipaddr.isValid(ip)) {
				throw new MechanismError(`Invalid IP address: '${ip}'`, 'error');
			}

			if (cidr) {
				try {
					ipaddr.parseCIDR(value);
				}
				catch (err) {
					throw new MechanismError(`Invalid CIDR format: '${value}'`, 'error');
				}
			}

			return value;
		}
	},
	ip6: {
		// ip6:<ip6-address>
		// ip6:<ip6-network>/<prefix-length>
		description: 'Match if IPv6 is in the given range',
		pattern: /^ip6:((.*?)(\/\d+)?)$/i,
		validate(r) {
			let parts = r.match(this.pattern);
			let value = parts[1];
			let ip = parts[2];
			let cidr = parts[3];

			if (!value) {
				throw new MechanismError(`Missing or blank mandatory network specification for the 'ip6' mechanism.`, 'error');
			}

			if (!ipaddr.isValid(ip)) {
				throw new MechanismError(`Invalid IPv6 address: '${ip}'`, 'error');
			}

			if (cidr) {
				try {
					ipaddr.parseCIDR(value);
				}
				catch (err) {
					throw new MechanismError(`Invalid CIDR format: '${value}'`, 'error');
				}
			}

			return value;
		}
	},
	a: {
		// a
		// a/<prefix-length>
		// a:<domain>
		// a:<domain>/<prefix-length>
		description: 'Match if IP has a DNS \'A\' record in given domain',
		pattern: /a((:.*?)?(\/\d*)?)?$/i,
		validate(r) {
			return domainPrefixCheck('a', this.pattern, r);
		}
	},
	mx: {
		// mx
		// mx/<prefix-length>
		// mx:<domain>
		// mx:<domain>/<prefix-length>
		description: '',
		pattern: /mx((:.*?)?(\/\d*)?)?$/i,
		validate(r) {
			return domainPrefixCheck('mx', this.pattern, r);
		}
	},
	ptr: {
		// ptr
		// ptr:<domain>
		description: 'Match if IP has a DNS \'PTR\' record within given domain',
		pattern: /^ptr(:.*?)?$/i,
		validate(r) {
			return domainCheckNullable('ptr', this.pattern, r);
		}
	},
	exists: {
		pattern: /^exists(:.*?)?$/i,
		validate(r) {
			return domainCheck('exists', this.pattern, r);
		}
	},
	include: {
		description: 'The specified domain is searched for an \'allow\'',
		pattern: /^include(:.*?)?$/i,
		validate(r) {
			return domainCheck('include', this.pattern, r);
		}
	},
	redirect: {
		description: 'The SPF record for the value replaces the current record',
		pattern: /redirect(\=.*?)?$/i,
		validate(r) {
			return domainCheck('redirect', this.pattern, r);
		}
	},
	exp: {
		description: 'Explanation message to send with rejection',
		pattern: /exp(\=.*?)?$/i,
		validate(r) {
			return domainCheck('exp', this.pattern, r);
		}
	}
};
