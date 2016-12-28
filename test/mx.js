import test from 'ava';
import mechanisms from '../mechanisms';
import prefixes from '../prefixes';
import s from '../';

test('Can parse simple mx term', t => {
	t.deepEqual(s.parseTerm('mx', []), {
		prefix: '+',
		prefixdesc: prefixes['+'],
		type: 'mx',
		description: mechanisms.mx.description
	});
});

test('Blank mx domain argument fails', t => {
	const m = [];
	s.parseTerm('mx:', m);
	t.deepEqual(m, [
		{
			message: `Blank argument for the 'mx' mechanism`,
			type: 'error'
		}
	]);
});

test('Blank mx CIDR argument fails', t => {
	const m = [];
	s.parseTerm('mx/', m);
	t.deepEqual(m, [
		{
			message: `Blank argument for the 'mx' mechanism`,
			type: 'error'
		}
	]);
});

test('Can parse a term with domain', t => {
	t.deepEqual(s.parseTerm('mx:foo.com', []), {
		prefix: '+',
		prefixdesc: prefixes['+'],
		type: 'mx',
		value: 'foo.com',
		description: mechanisms.mx.description
	});
});

test('Can parse mx term with CIDR', t => {
	t.deepEqual(s.parseTerm('mx/32', []), {
		prefix: '+',
		prefixdesc: prefixes['+'],
		type: 'mx',
		value: '/32',
		description: mechanisms.mx.description
	});
});

test('Can parse mx term with domain and CIDR', t => {
	t.deepEqual(s.parseTerm('mx:foo.com/32', []), {
		prefix: '+',
		prefixdesc: prefixes['+'],
		type: 'mx',
		value: 'foo.com/32',
		description: mechanisms.mx.description
	});
});

test('mx term with invalid domain fails', t => {
	const m = [];
	s.parseTerm('mx:blahblahblah', m);
	t.deepEqual(m, [
		{
			message: `Invalid domain for the 'mx' mechanism: 'blahblahblah'`,
			type: 'error'
		}
	]);
});
