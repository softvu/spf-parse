import test from 'ava';
import mechanisms from '../mechanisms';
import prefixes from '../prefixes';
import s from '../';

test('Invalid version causes error', t => {
	t.deepEqual(s('v=spf2 a ~all'), {
		valid: false,
		mechanisms: [],
		messages: [
			{
				message: 'No valid version found, record must start with \'v=spf1\'',
				type: 'error'
			}
		]
	});
});

test('Missing term fails', t => {
	const m = [];
	s.parseTerm('?', m);
	t.deepEqual(m, [
		{
			message: `Unknown standalone term '?'`,
			type: 'error'
		}
	]);
});

test('Can parse a good record', t => {
	t.deepEqual(s('v=spf1 a -all'), {
		valid: true,
		mechanisms: [
			{
				prefix: 'v',
				type: 'version',
				value: 'spf1',
				description: 'The SPF record version'
			},
			{
				prefix: '+',
				prefixdesc: 'Pass',
				type: 'a',
				description: 'Match if IP has a DNS \'A\' record in given domain'
			},
			{
				prefix: '-',
				prefixdesc: 'Fail',
				type: 'all',
				description: 'Always matches. It goes at the end of your record'
			}
		]
	});
});

test('Can parse ip4', t => {
	t.deepEqual(s.parseTerm('ip4:127.0.0.1'), {
		prefix: '+',
		prefixdesc: prefixes['+'],
		type: 'ip4',
		value: '127.0.0.1',
		description: mechanisms.ip4.description
	});
});

test('Can parse ip4 with CIDR', t => {
	t.deepEqual(s.parseTerm('ip4:127.0.0.1/32'), {
		prefix: '+',
		prefixdesc: prefixes['+'],
		type: 'ip4',
		value: '127.0.0.1/32',
		description: mechanisms.ip4.description
	});
});

test('Invalid ip4 fails', t => {
	const m = [];
	s.parseTerm('ip4:300.0.0.1', m);
	t.deepEqual(m, [
		{
			message: `Invalid IP address: '300.0.0.1'`,
			type: 'error'
		}
	]);
});

test('Blank ip4 fails', t => {
	const m = [];
	s.parseTerm('ip4:', m);
	t.deepEqual(m, [
		{
			message: `Missing or blank mandatory network specification for the 'ip4' mechanism.`,
			type: 'error'
		}
	]);
});

test('Invalid ip4 CIDR fails', t => {
	const m = [];
	s.parseTerm('ip4:8.8.8.8/33', m);
	t.deepEqual(m, [
		{
			message: `Invalid CIDR format: '8.8.8.8/33'`,
			type: 'error'
		}
	]);
});

test('Can parse ip6', t => {
	t.deepEqual(s.parseTerm('ip6:::1', []), {
		prefix: '+',
		prefixdesc: prefixes['+'],
		type: 'ip6',
		value: '::1',
		description: mechanisms.ip6.description
	});
});

test('Can parse ip6 with CIDR', t => {
	t.deepEqual(s.parseTerm('ip6:::1/32', []), {
		prefix: '+',
		prefixdesc: prefixes['+'],
		type: 'ip6',
		value: '::1/32',
		description: mechanisms.ip6.description
	});
});

test('Blank ip6 fails', t => {
	const m = [];
	s.parseTerm('ip6:', m);
	t.deepEqual(m, [
		{
			message: `Missing or blank mandatory network specification for the 'ip6' mechanism.`,
			type: 'error'
		}
	]);
});

test('Invalid ip6 fails', t => {
	const m = [];
	s.parseTerm('ip6:foo', m);
	t.deepEqual(m, [
		{
			message: `Invalid IPv6 address: 'foo'`,
			type: 'error'
		}
	]);
});

test('Invalid ip6 CIDR fails', t => {
	const m = [];
	s.parseTerm('ip6:::1/720', m);
	t.deepEqual(m, [
		{
			message: `Invalid CIDR format: '::1/720'`,
			type: 'error'
		}
	]);
});

test('Policy string without "all" or "redirect" at the end will produce a warning', t => {
	let records = s('v=spf1 include:foo.com');

	t.truthy(records.messages && records.messages.find(x => /should always either use an "all" mechanism/i.test(x.message)));
});

test('Terms after "all" cause a warning', t => {
	let records = s('v=spf1 ~all a');

	t.truthy(records.messages && records.messages.find(x => /one or more mechanisms were found after the "all" mechanism/i.test(x.message)));
});

test(`Give a warning if there's a redirect modifier AND an "all" mechanism`, t => {
	let records = s('v=spf1 redirect=foo.com ~all');

	t.truthy(records.messages && records.messages.find(x => /The "redirect" modifier will not be used, because the SPF string contains an "all" mechanism/i.test(x.message)));
});

test(`Give a warning if there's duplicate mechanisms`, t => {
	let records = s('v=spf1 a a ~all');

	t.truthy(records.messages && records.messages.find(x => /one or more duplicate/i.test(x.message)));
});

test(`Give an error if there's duplicate modifier`, t => {
	let records = s('v=spf1 redirect=foo.com redirect=bar.com ~all');

	t.truthy(records.messages && records.messages.find(x => {
		return /Modifiers like "redirect" may appear only once in an SPF string/i.test(x.message) &&
		x.type === 'error';
	}));
});
