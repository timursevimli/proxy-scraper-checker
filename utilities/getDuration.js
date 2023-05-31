'use strict';
const { performance } = require('node:perf_hooks');
module.exports = () => {
  const start = performance.now();
  return () => Math.floor(performance.now() - start);
};
