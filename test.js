import test from 'ava';
import s from './';

test(t => {
  t.deepEqual(s('v=spf1 a -all'), [
    // { prefix: 'v', type: 'version', value: 'spf1', description: 'The SPF record version' },
    { prefix: '+', value: 'a', description: "Match if IP has a DNS 'A' record in given domain" },
    { prefix: '-', value: 'all', description: '	Always matches. It goes at the end of your record.' }
  ]);
});
