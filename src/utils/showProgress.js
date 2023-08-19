'use strict';

const { logger } = require('../lib');

module.exports = (total, count, success, failed) => {
  const progress = ((count / total) * 100).toFixed(0);
  const logs = [
    `Total: ${total}`,
    '|',
    `Success: ${success}`,
    '|',
    `Failed: ${failed}`,
    '|',
    `Progress: %${progress}`,
  ];
  logger.progress('info', count, total, ...logs);
};
