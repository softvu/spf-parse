'use strict';

/* eslint no-useless-escape: 0 */

const tld = require('tldjs');
const ipaddr = require('ipaddr.js');
const MechanismError = require('./mechanismerror');

// TODO: need to validate CIDRs and IPs in the patterns

module.exports = {
	version: {
		description: 'The SPF record version',
		pattern: /^v=(.+)$/,
		validate(r) {
			let version = r.match(this.pattern)[1];
			if (version !== 'spf1') {
				throw new MechanismError(`Invalid version '${version}', must be 'spf1'`);
			}
			return version;
		}
	},
	all: {
		description: 'Always matches. It goes at the end of your record',
		pattern: /^all$/
	},
	ip4: {
		// ip4:<ip4-address>
		// ip4:<ip4-network>/<prefix-length>
		description: 'Match if IP is in the given range',
		pattern: /^ip4:(([\d\.]+)(\/\d+)?)$/,
		validate(r) {
			let parts = r.match(this.pattern);
			let value = parts[1];
			let ip = parts[2];
			let cidr = parts[3];

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
		pattern: /^ip6:(.+)(\/\d+)?$/
	},
	a: {
		// a
		// a/<prefix-length>
		// a:<domain>
		// a:<domain>/<prefix-length>
		description: 'Match if IP has a DNS \'A\' record in given domain',
		pattern: /a(:.+?)?(\/\d+)?/
	},
	mx: {
		// mx
		// mx/<prefix-length>
		// mx:<domain>
		// mx:<domain>/<prefix-length>
		description: '',
		pattern: /mx(:.+?)?(\/\d+)?/
	},
	ptr: {
		// ptr
		// ptr:<domain>
		description: 'Match if IP has a DNS \'PTR\' record within given domain',
		pattern: /^ptr:(.+)$/
	},
	exists: {
		pattern: /^exists:(.+)$/,
		validate(r) {
			let domain = r.match(this.pattern)[1];
			if (!tld.isValid(domain)) {
				throw new MechanismError('Invalid domain: \'domain\'', 'warning');
			}
			else {
				return domain;
			}
		}
	},
	include: {
		description: 'The specified domain is searched for an \'allow\'',
		pattern: /^include:(.+)$/,
		validate(r) {
			let domain = r.match(this.pattern)[1];
			if (!tld.isValid(domain)) {
				throw new MechanismError('Invalid domain: \'domain\'', 'error');
			}
			else {
				return domain;
			}
		}
	},
	redirect: {
		description: 'The SPF record for Value replaces the current record',
		pattern: /redirect=(.+)/
	},
	exp: {
		description: 'Explanation message to send with rejection',
		pattern: /exp=(.+)/ // Capture is a domain
	}
};
