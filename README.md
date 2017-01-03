# spf-parse [![Build Status](https://travis-ci.org/softvu/spf-parse.svg?branch=master)](https://travis-ci.org/softvu/spf-parse) [![Coverage Status](https://coveralls.io/repos/github/softvu/spf-parse/badge.svg?branch=master&foo=bar)](https://coveralls.io/github/softvu/spf-parse?branch=master) [![Dependency Status](https://dependencyci.com/github/softvu/spf-parse/badge)](https://dependencyci.com/github/softvu/spf-parse) [![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)
> Parse SPF records into their constituent parts. Note that this module does no
> network lookups. It only validates and parses SPF syntax.

# Install

    npm install --save spf-parse

# Usage

```javascript
const spf = require('spf-parse');

let records = spf('v=spf1 include:some.sender.org -all');

// {
//    mechanisms: [
//       {
//          prefix: 'v',
//          type: 'version',
//          description: 'The SPF record version',
//          value: 'spf1'
//       },
//       {
//          prefix: '+',
//          prefixdesc: 'Pass',
//          type: 'include',
//          description: 'The specified domain is searched for an \'allow\'',
//          value: 'some.sender.org'
//       },
//       {
//          prefix: '-',
//          prefixdesc: 'Fail',
//          type: 'all',
//          description: 'Always matches. It goes at the end of your record'
//       }
//    ]
// }
```

# License

MIT © [SoftVu](https://softvu.com)
