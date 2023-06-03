'use strict';

const { exec } = require('node:child_process');
const { getDuration, getGeoInfo } = require('../utilities');

const curlSocks4 = (proxy, cb) => {
  const url = 'https://www.google.com';
  const cmd = (
    `curl -s -o /dev/null -w "%{http_code}" --socks4 ${proxy} ${url}`
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
      const err = 'Socks4 is not supported!';
      cb(err);
    }
  });
};

module.exports = curlSocks4;
