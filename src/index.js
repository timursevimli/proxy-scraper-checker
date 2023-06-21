'use strict';
const { getSource, logger } = require('./utils/');
const checkers = require('./checkers/');
const scraper = require('./scraper.js');
const checker = require('./checker.js');

const logFile = __dirname + '/../logs/proxy-checker.log';
const appLogger = logger(logFile)(JSON.stringify)('ProxyChecker');
const errorLog = appLogger('main')('error');

process.on('uncaughtExceptionMonitor', errorLog);
process.on('uncaughtException', (err) => {
  console.error(err.stack || err);
  errorLog(err);
  setTimeout(process.exit, 0, 1);
});

const sequentialCheck = async (proxies, tasks, logger, options) => {
  console.log({ tasks, options });
  for (const task of tasks) {
    await checker(proxies, task, logger, options);
  }
};

const parallelCheck = (proxies, tasks, logger, options) =>
  new Promise((resolve) => {
    const promises = tasks.map(
      (task) => checker(proxies, task, logger, options)
    );
    Promise.all(promises).finally(resolve);
  });

const finalize = () => {
  console.log('All done!');
  setTimeout(() => {
    process.exit(0);
  }, 1000);
};

const executionOptions = { multi: parallelCheck, single: sequentialCheck };

const boot = async ({
  mode = 'single',
  timeout = 10000,
  source = 'proxy_sources.txt',
  test = false,
  channels = 100,
} = {}) => {
  const proxySources = await getSource(source);
  const sources = test ? proxySources.splice(0, 3) : proxySources;
  const proxies = await scraper(sources, appLogger);
  const executioner = executionOptions[mode];
  if (executioner) {
    const tasks = Object.values(checkers);
    if (mode === 'multi') channels  = (channels / tasks.length).toFixed(0);
    await executioner(proxies, tasks, appLogger, { timeout, channels });
    finalize();
  } else {
    const msg = 'Wrong mode, use \'single\' or \'multi\' mode in config.json!';
    throw new Error(msg);
  }
};

module.exports = boot;
