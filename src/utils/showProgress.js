'use strict';

module.exports = (logger, total, count, success, failed) => {
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
