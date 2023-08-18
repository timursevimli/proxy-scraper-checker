'use strict';

const { curry } = require('./utils');
const { logger } = require('./lib');
const checkers = require('./checkers');
const checker = require('./checker.js');
const scraper = require('./scraper.js');

const seqCheck = async (tasks, options, proxies) => {
  for (const task of tasks) await checker(proxies, task, options);
};

const parCheck = (tasks, options, proxies) =>
  new Promise((resolve) => {
    const promises = tasks.map((task) => checker(proxies, task, options));
    Promise.all(promises).finally(resolve);
  });

const finalize = async () => {
  logger.show('system', 'All done!');
  await logger.close();
  process.exit(0);
};

const executorOptions = {
  multi: {
    executor: curry(parCheck),
    getChannel: (ch, count) => (ch / count).toFixed(0),
  },
  single: {
    executor: curry(seqCheck),
    getChannel: (ch) => ch,
  },
};

const initCheckers = (options) => {
  const executorOption = executorOptions[options.mode];
  const { executor, getChannel } = executorOption;
  const tasks = Object.values(checkers);
  const channels = getChannel(options.channels, tasks.length);
  return executor(tasks, { ...options, channels });
};

const boot = async (options) => {
  const proxies = await scraper(options.scraper);
  const checkersExecutor = initCheckers(options.checker);
  await checkersExecutor(proxies);
  finalize();
};

process.on('uncaughtExceptionMonitor', (err) => void logger.show('error', err));

process.on('uncaughtException', async (err) => {
  logger.error(err);
  await logger.close();
  process.exit(1);
});

process.on('SIGINT', async () => {
  logger.show('system', 'EXITING...');
  await logger.close();
  process.exit(0);
});

module.exports = boot;
