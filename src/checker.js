'use strict';

const { Queue, logger } = require('./lib/');
const { showProgress } = require('./utils');

module.exports = (proxies, checker, options) => {
  const { channels, timeout, logging } = options;
  const name = checker.name.replace('check', '').toUpperCase();

  let count = 0;
  let success = 0;
  let failed = 0;

  return new Promise((resolve) => {
    const queue = Queue.channels(channels)
      .process(checker)
      .drain(() => {
        logger.show('system', `${name} checker is done!`);
        resolve();
      })
      .success((res) => {
        if (logging.success) logger.log(res);
        success++;
      })
      .failure((err) => {
        if (logging.failures) logger.error(err);
        failed++;
      })
      .done(() => void showProgress(proxies.size, ++count, success, failed));

    logger.show('system', `${name} checker started!`);
    for (const proxy of proxies) queue.add({ proxy, timeout });
  });

};
