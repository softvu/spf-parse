import test from 'ava';
import mechanisms from '../mechanisms';
import prefixes from '../prefixes';
import s from '../';

test('No redirect argument fails', t => {
	const m = [];
	s.parseTerm('redirect', m);
	t.deepEqual(m, [
		{
			message: `Missing mandatory argument for the 'redirect' mechanism`,
			type: 'error'
		}
	]);
});

test('Blank redirect domain argument fails', t => {
	const m = [];
	s.parseTerm('redirect=', m);
	t.deepEqual(m, [
		{
			message: `Blank argument for the 'redirect' mechanism`,
			type: 'error'
		}
	]);
});

test('Can parse redirect term with domain', t => {
	t.deepEqual(s.parseTerm('redirect=foo.com', []), {
		prefix: '+',
		prefixdesc: prefixes['+'],
		type: 'redirect',
		value: 'foo.com',
		description: mechanisms.redirect.description
	});
});

test('redirect term with invalid domain fails', t => {
	const m = [];
	s.parseTerm('redirect=blahblahblah', m);
	t.deepEqual(m, [
		{
			message: `Invalid domain for the 'redirect' mechanism: 'blahblahblah'`,
			type: 'error'
		}
	]);
});
