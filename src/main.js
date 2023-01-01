'use strict';
const proxyChecker = require('./utilities/proxyChecker.js');
const proxyScraper = require('./utilities/proxyScraper.js');
const proxySources = require('./sources/proxySources.js');
const consoleDescription = require('./helpers/consoleDescription.js');
const { toMinute, measureElapsedTimeOnSec } = require('./helpers/times.js');

const bootstrap = async () => {
  consoleDescription();

  const totalStart = measureElapsedTimeOnSec();
  const scraperStart = measureElapsedTimeOnSec();
  const scrapedProxies = await proxyScraper(proxySources);
  const scraperElapsed = scraperStart();

  const checkerStart = measureElapsedTimeOnSec();
  await proxyChecker(scrapedProxies);
  const checkerElapsed = checkerStart();


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
