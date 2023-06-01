'use strict';
const { Agent } = require('node:http');
const randomUAgent = require('./randomUAgent.js');

const serializeData = ({
  city,
  country,
  countryCode,
  region,
  regionName,
}, host, port) => ({
  city,
  country,
  countryCode,
  region,
  regionName,
  host,
  port,
});

module.exports = (proxy, useProxy = false) => new Promise((resolve, reject) => {
  const [host, port] = proxy.split(':');
  if (!host && !port) {
    const err = 'Host or port is undefined!';
    reject(new Error(err));
    return;
  }
  const url = `http://ip-api.com/json/${host}`;
  const timeout = 10000;
  const options = {
    timeout,
    method: 'GET',
    headers: {
      'User-agent': randomUAgent(),
      'Content-Type': 'application/json',
    }
  };
  if (useProxy) {
    const agent = new Agent({
      keepAlive: false,
      timeout,
      host,
      port,
    });
    options.agent = agent;
  }
  fetch(url, options)
    .then(
      (res) => {
        if (res.status === 200) {
          res.json()
            .then(
              (data) => {
                if (data) {
                  const result = serializeData(data, host, port);
                  resolve(result);
                } else {
                  const err = 'Geo data not found!';
                  reject(new Error(err));
                }
              },
              (reason) => reject(reason)
            )
            .catch((err) => reject(err));
        }
      },
      (reason) => reject(reason)
    )
    .catch((err) => reject(err));
});
