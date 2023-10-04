'use strict';

const checkers = require('./checkers');
const checker = require('./checker.js');
const scraper = require('./scraper.js');
const { Logger, curry } = require('./lib');
const { parseJson } = require('./utils');

const logger = new Logger('./logs');

const seqCheck = async (logger, tasks, options, proxies) => {
  for (const task of tasks) await checker(logger, proxies, task, options);
};

const parCheck = (logger, tasks, options, proxies) =>
  new Promise((resolve) => {
    const promises = tasks.map((task) =>
      checker(logger, proxies, task, options),
    );
    Promise.all(promises).finally(resolve);
  });

const finalize = async () => {
  logger.show('system', 'All done!');
  await logger.close();
  process.exit(0);
};

const executorOptions = {
  multi: {
    executor: curry(parCheck)(logger),
    getChannel: (ch, count) => (ch / count).toFixed(0),
  },
  single: {
    executor: curry(seqCheck)(logger),
    getChannel: (ch) => ch,
  },
};

const initCheckers = async (options) => {
  const executorOption = executorOptions[options.mode];
  const { executor, getChannel } = executorOption;
  const tasks = options.check.map((key) => checkers[key]);
  const tasksCount = Object.keys(tasks).length;
  const channels = getChannel(options.channels, tasksCount);
  return await executor(tasks, { ...options, channels });
};

const boot = async (options) => {
  const proxies = await scraper(logger, options.scraper);
  const checkersExecutor = await initCheckers(options.checker);
  await checkersExecutor(proxies);
  if (options.parser.json) await parseJson(logger.logFile);
  await finalize();
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
