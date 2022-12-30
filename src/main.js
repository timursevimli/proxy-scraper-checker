'use strict';
const ProxyRepository = require('./repository/ProxyRepository.js');
const proxyChecker = require('./utilities/proxyChecker.js');
const proxyScraper = require('./utilities/proxyScraper.js');
const proxySources = require('./sources/proxySources.js');
const { saveAlivesToLog } = require('./helpers/logSaver.js');
const postgresConfig = require('./database/postgresConfig.js');
const consoleDescription = require('./helpers/consoleDescription.js');

const toMinute = (seconds) => {
  const minutes = Math.trunc(seconds / 60);
  const remainingSeconds = Math.trunc((seconds / 60 - minutes) * 60);
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
};

const measureElapsedTimeOnSec = () => {
  const startTime = process.hrtime();
  return () => {
    const elapsedTime = process.hrtime(startTime);
    return (elapsedTime[0] + elapsedTime[1] / 1e9).toFixed();
  };
};

const bootstrap = async () => {
  consoleDescription();
  const logAlives = JSON.parse(process.env.ALIVE_LOGGING);

  const totalStart = measureElapsedTimeOnSec();
  const proxyService = new ProxyRepository(postgresConfig, saveAlivesToLog);
  await proxyService.migrateTables();
  const scraperStart = measureElapsedTimeOnSec();
  await proxyScraper(proxyService, proxySources);
  const scraperElapsed = scraperStart();

  const checkerStart = measureElapsedTimeOnSec();
  await proxyChecker(proxyService);
  const checkerElapsed = checkerStart();

  if (logAlives) await proxyService.checkedProxiesLogSave();

  await proxyService.close();
  const totalElapsed = totalStart();

  const timeData = [
    {
      timerName: 'Scraping Elapse',
      elapsedMinutes: toMinute(scraperElapsed),
      elapsedSeconds: scraperElapsed
    },
    {
      timerName: 'Checking Elapse',
      elapsedMinutes: toMinute(checkerElapsed),
      elapsedSeconds: checkerElapsed
    },
    {
      timerName: 'Total Elapse',
      elapsedMinutes: toMinute(totalElapsed),
      elapsedSeconds: totalElapsed
    },
  ];

  console.table(timeData);
  process.exit(0);
};


bootstrap();
