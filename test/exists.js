import test from 'ava';
import mechanisms from '../mechanisms';
import prefixes from '../prefixes';
import s from '../';

test('No exists argument fails', t => {
	const m = [];
	s.parseTerm('exists', m);
	t.deepEqual(m, [
		{
			message: `Missing mandatory argument for the 'exists' mechanism`,
			type: 'error'
		}
	]);
});

test('Blank exists domain argument fails', t => {
	const m = [];
	s.parseTerm('exists:', m);
	t.deepEqual(m, [
		{
			message: `Blank argument for the 'exists' mechanism`,
			type: 'error'
		}
	]);
});

test('Can parse exists term with domain', t => {
	t.deepEqual(s.parseTerm('exists:foo.com', []), {
		prefix: '+',
		prefixdesc: prefixes['+'],
		type: 'exists',
		value: 'foo.com',
		description: mechanisms.exists.description
	});
});

test('exists term with invalid domain fails', t => {
	const m = [];
	s.parseTerm('exists:blahblahblah', m);
	t.deepEqual(m, [
		{
			message: `Invalid domain for the 'exists' mechanism: 'blahblahblah'`,
			type: 'error'
		}
	]);
});
