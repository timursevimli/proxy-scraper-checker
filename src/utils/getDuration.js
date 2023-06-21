'use strict';
const { performance } = require('node:perf_hooks');
module.exports = (begin) => (
  begin ? Math.floor(performance.now() - begin) : performance.now()
);
