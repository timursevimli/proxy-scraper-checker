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
  if (!host && !port) return;
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
          return res.json();
        }
      },
      (reason) => reject(reason)
    )
    .then(
      (data) => {
        const result = serializeData(data, host, port);
        resolve(result);
      },
      (reason) => reject(reason)
    )
    .catch((err) => reject(err));
});
