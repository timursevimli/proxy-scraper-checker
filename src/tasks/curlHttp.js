'use strict';

const { exec } = require('node:child_process');
const { getDuration, getGeoInfo } = require('../utilities');

const curlHttp = (proxy, cb) => {
  const url = 'http://www.google.com';
  const cmd = `curl ${url} -x ${proxy}`;
  const duration = getDuration();
  exec(cmd, (err, stdout, stderr) => {
    if (err || stderr) {
      cb(err || stderr);
      return;
    }
    if (stdout.includes('html')) {
      getGeoInfo(proxy)
        .then(
          (res) => {
            res.duration = duration();
            cb(null, res);
          },
          (reason) => cb(reason)
        );
    } else {
      const err = 'Http is not supported!';
      cb(err);
    }
  });
};

module.exports = curlHttp;
