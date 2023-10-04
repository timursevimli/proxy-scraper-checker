'use strict';

const { performance } = require('node:perf_hooks');

const getDuration = (begin) => {
  if (begin) return Math.floor(performance.now() - begin);
  return performance.now();
};

module.exports = { getDuration };
