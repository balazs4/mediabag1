const extractor = require('./lib/rtlmost');
const [_, __, day] = process.argv;
extractor('ejjel-nappal', day).then(console.log).catch(console.error);
