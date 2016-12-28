import test from 'ava';
import s from './';

test('Invalid version causes error', t => {
	t.deepEqual(s('v=spf2 a ~all'), {
		mechanisms: [],
		messages: [
			{
				message: 'No valid version found, record must start with \'v=spf1\'',
				type: 'error'
			}
		]
	});
});

test('Can parse a good record', t => {
	t.deepEqual(s('v=spf1 a -all'), {
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
