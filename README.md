# spft-parse [![Build Status](https://travis-ci.org/softvu/spf-parse.svg?branch=master)](https://travis-ci.org/softvu/spf-parse)
> Parse SPF records into their constituent parts. Note that this module does no
> network lookups. It only validates and parses SPF syntax.

# Install

    npm install --save spf-parse

# Usage

```javascript
const spf = require('spf-parse');

let records = spf('v=spf1 include:some.sender.org -all');

// records == [
//	{  }
// ];
```

# License

MIT © [SoftVu](https://softvu.com)
