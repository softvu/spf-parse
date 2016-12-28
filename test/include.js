import test from 'ava';
import mechanisms from '../mechanisms';
import prefixes from '../prefixes';
import s from '../';

test('No include argument fails', t => {
	const m = [];
	s.parseTerm('include', m);
	t.deepEqual(m, [
		{
			message: `Missing mandatory argument for the 'include' mechanism`,
			type: 'error'
		}
	]);
});

test('Blank include domain argument fails', t => {
	const m = [];
	s.parseTerm('include:', m);
	t.deepEqual(m, [
		{
			message: `Blank argument for the 'include' mechanism`,
			type: 'error'
		}
	]);
});

test('Can parse include term with domain', t => {
	t.deepEqual(s.parseTerm('include:foo.com', []), {
		prefix: '+',
		prefixdesc: prefixes['+'],
		type: 'include',
		value: 'foo.com',
		description: mechanisms.include.description
	});
});

test('include term with invalid domain fails', t => {
	const m = [];
	s.parseTerm('include:blahblahblah', m);
	t.deepEqual(m, [
		{
			message: `Invalid domain for the 'include' mechanism: 'blahblahblah'`,
			type: 'error'
		}
	]);
});
