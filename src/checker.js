'use strict';

const { Queue, logger } = require('./lib/');

module.exports = (proxies, checker, options) =>
  new Promise((resolve) => {
    const { channels, timeout, logging } = options;
    const name = checker.name.replace('check', '').toUpperCase();
    const queue = Queue.channels(channels)
      .process(checker)
      .drain(() => {
        logger.show('system', `${name} checker is done!`);
        resolve();
      });

    if (logging.success) queue.success((res) => void logger.log(res));
    if (logging.failures) queue.failure((err) => void logger.error(err));

    logger.show('system', `${name} checker started!`);
    for (const proxy of proxies) queue.add({ proxy, timeout });
  });
