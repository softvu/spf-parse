import test from 'ava';
import mechanisms from '../mechanisms';
import prefixes from '../prefixes';
import s from '../';

test('Can parse simple a term', t => {
	t.deepEqual(s.parseTerm('a', []), {
		prefix: '+',
		prefixdesc: prefixes['+'],
		type: 'a',
		description: mechanisms.a.description
	});
});

test('Blank a domain argument fails', t => {
	const m = [];
	s.parseTerm('a:', m);
	t.deepEqual(m, [
		{
			message: `Blank argument for the 'a' mechanism`,
			type: 'error'
		}
	]);
});

test('Blank a CIDR argument fails', t => {
	const m = [];
	s.parseTerm('a/', m);
	t.deepEqual(m, [
		{
			message: `Blank argument for the 'a' mechanism`,
			type: 'error'
		}
	]);
});

test('Can parse a term with domain', t => {
	t.deepEqual(s.parseTerm('a:foo.com', []), {
		prefix: '+',
		prefixdesc: prefixes['+'],
		type: 'a',
		value: 'foo.com',
		description: mechanisms.a.description
	});
});

test('Can parse a term with CIDR', t => {
	t.deepEqual(s.parseTerm('a/32', []), {
		prefix: '+',
		prefixdesc: prefixes['+'],
		type: 'a',
		value: '/32',
		description: mechanisms.a.description
	});
});

test('Can parse a term with domain and CIDR', t => {
	t.deepEqual(s.parseTerm('a:foo.com/32', []), {
		prefix: '+',
		prefixdesc: prefixes['+'],
		type: 'a',
		value: 'foo.com/32',
		description: mechanisms.a.description
	});
});

test('a term with invalid domain fails', t => {
	const m = [];
	s.parseTerm('a:blahblahblah', m);
	t.deepEqual(m, [
		{
			message: `Invalid domain for the 'a' mechanism: 'blahblahblah'`,
			type: 'error'
		}
	]);
});
