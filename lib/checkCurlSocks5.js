'use strict';
const { exec } = require('node:child_process');
const { Queue, getGeoInfo, getDuration, logger } = require('../utilities/');

const logFile = __dirname + '/../logs/checkCurlSock5.log';
const log = logger(logFile)(JSON.stringify)('ProxyChecker')('checkCurlSocks5');
const infoLog = log('info');
const errorLog = log('error');
//TODO: Fix Process finish!
const URL = 'https://www.google.com';
module.exports = (proxies, { channels = 30, timeout = 10000 } = {}) =>
  new Promise((resolve) => {
    const queue = Queue.channels(channels.socks)
      .timeout(timeout)
      .process((proxy, cb) => {
        const cmd = (
          `curl -s -o /dev/null -w "%{http_code}" --socks5 ${proxy} ${URL}`
        );
        const duration = getDuration();
        exec(cmd, (err, stdout, stderr) => {
          if (err || stderr) {
            cb(err || stderr);
            return;
          }
          if (stdout.includes('200')) {
            getGeoInfo(proxy)
              .then(
                (res) => {
                  res.duration = duration();
                  cb(null, res);
                },
                (reason) => cb(reason)
              );
          } else {
            const err = 'Socks5 is not supported!';
            cb(err);
          }
        });
      })
      .success((res) => {
        console.log({ res });
        infoLog(res);
      })
      .failure((err) => {
        console.log({ err });
        errorLog(err);
      })
      .drain(() => {
        console.log('CheckCurlSock5 done!');
        resolve();
      });

    proxies.forEach((proxy) => queue.add(proxy));
  });
