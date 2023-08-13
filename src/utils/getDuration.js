'use strict';

const { performance } = require('node:perf_hooks');

module.exports = (begin) => {
  if (begin) return Math.floor(performance.now() - begin);
  return performance.now();
};
