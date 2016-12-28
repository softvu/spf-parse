import test from 'ava';
import mechanisms from '../mechanisms';
import prefixes from '../prefixes';
import s from '../';

test('No exp argument fails', t => {
	const m = [];
	s.parseTerm('exp', m);
	t.deepEqual(m, [
		{
			message: `Missing mandatory argument for the 'exp' mechanism`,
			type: 'error'
		}
	]);
});

test('Blank exp domain argument fails', t => {
	const m = [];
	s.parseTerm('exp=', m);
	t.deepEqual(m, [
		{
			message: `Blank argument for the 'exp' mechanism`,
			type: 'error'
		}
	]);
});

test('Can parse exp term with domain', t => {
	t.deepEqual(s.parseTerm('exp=foo.com', []), {
		prefix: '+',
		prefixdesc: prefixes['+'],
		type: 'exp',
		value: 'foo.com',
		description: mechanisms.exp.description
	});
});

test('exp term with invalid domain fails', t => {
	const m = [];
	s.parseTerm('exp=blahblahblah', m);
	t.deepEqual(m, [
		{
			message: `Invalid domain for the 'exp' mechanism: 'blahblahblah'`,
			type: 'error'
		}
	]);
});
