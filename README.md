# spft-parse [![Build Status](https://travis-ci.org/softvu/spf-parse.svg?branch=master)](https://travis-ci.org/softvu/spf-parse)
> Parse SPF records into their constituent parts

# Install

    npm install --save spf-parse

# Usage

```javascript
const spf = require('spf-parse');

let records = spf('v=spf1 include:some.sender.org -all');

// records == [
//
// ];
```

# License

MIT © [SoftVu](https://softvu.com)
