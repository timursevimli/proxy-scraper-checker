'use strict';
const { Agent } = require('node:http');
const {
  Queue,
  randomUAgent,
  getGeoInfo,
  logger,
  getDuration,
} = require('../utilities/');

const logFile = __dirname + '/../logs/checkHttp.log';
const log = logger(logFile)(JSON.stringify)('ProxyChecker')('checkHttp');
const infoLog = log('info');
const errorLog = log('error');

module.exports = (proxies, { channels, timeout = 10000 } = {}) =>
  new Promise((resolve) => {
    const queue = Queue.channels(channels.http)
      .timeout(timeout)
      .process((proxy, cb) => {
        const [host, port] = proxy.split(':');
        const url = 'http://google.com';
        const agent = new Agent({
          keepAlive: false,
          // keepAliveMsecs: 1000,
          timeout,
          host,
          port,
        });
        const options = {
          agent,
          timeout,
          method: 'GET',
          headers: {
            'User-agent': randomUAgent(),
            'Content-Type': 'application/json',
          }
        };
        const duration = getDuration();
        fetch(url, options)
          .then(
            (res) => {
              if (res.status === 200) {
                getGeoInfo(proxy).then(
                  (res) => {
                    res.duration = duration();
                    cb(null, res);
                  },
                  (reason) => cb(reason)
                );
              }
            },
            (reason) => cb(reason)
          )
          .catch((err) => cb(err));
      })
      .success(infoLog)
      .failure(errorLog)
      .drain(() => {
        console.log('HttpChecker Done!');
        resolve();
      });

    proxies.forEach((proxy) => queue.add(proxy));
  });
