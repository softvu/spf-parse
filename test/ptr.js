import test from 'ava';
import mechanisms from '../mechanisms';
import prefixes from '../prefixes';
import s from '../';

test('Can parse simple ptr term', t => {
	t.deepEqual(s.parseTerm('ptr', []), {
		prefix: '+',
		prefixdesc: prefixes['+'],
		type: 'ptr',
		description: mechanisms.ptr.description
	});
});

test('Blank ptr domain argument fails', t => {
	const m = [];
	s.parseTerm('ptr:', m);
	t.deepEqual(m, [
		{
			message: `Blank argument for the 'ptr' mechanism`,
			type: 'error'
		}
	]);
});

test('Can parse ptr term with domain', t => {
	t.deepEqual(s.parseTerm('ptr:foo.com', []), {
		prefix: '+',
		prefixdesc: prefixes['+'],
		type: 'ptr',
		value: 'foo.com',
		description: mechanisms.ptr.description
	});
});

test('ptr term with invalid domain fails', t => {
	const m = [];
	s.parseTerm('ptr:blahblahblah', m);
	t.deepEqual(m, [
		{
			message: `Invalid domain for the 'ptr' mechanism: 'blahblahblah'`,
			type: 'error'
		}
	]);
});
