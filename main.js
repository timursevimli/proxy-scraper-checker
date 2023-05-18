'use strict';
const { scraper, httpChecker } = require('./lib');
const { getSource } = require('./utilities');
const proxySources = getSource('proxy_sources.txt');

(async () => {
  const scrapedProxies = await scraper(proxySources, 10000);
  httpChecker(scrapedProxies);
  // console.dir({ scrapedProxies });
})();
