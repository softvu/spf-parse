import test from 'ava';
// import mechanisms from '../mechanisms';
// import prefixes from '../prefixes';
import s from '../';

test('Invalid qualifier fails', t => {
	const m = [];
	s.parseTerm('@include:bar.com', m);
	t.deepEqual(m, [
		{
			message: `Unknown standalone term '@include:bar.com'`,
			type: 'error'
		}
	]);
});
