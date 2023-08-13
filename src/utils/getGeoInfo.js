'use strict';

const { Agent } = require('node:http');
const randomUAgent = require('./randomUAgent.js');

const serializeData = (data, host, port) => {
  const { city, country, countryCode, region, regionName, isp } = data;
  return `${host}:${port}
    ${countryCode}
    ${country}
    ${city}
    ${region}
    ${regionName}
    ${isp}`;
};

module.exports = async (proxy, useProxy = false) => {
  const [host, port] = proxy.split(':');
  const url = `http://ip-api.com/json/${host}`;
  const options = {
    method: 'GET',
    headers: {
      Connection: 'close',
      'User-agent': randomUAgent(),
      'Content-Type': 'application/json',
    },
  };
  if (useProxy) options.agent = new Agent({ host, port });
  const res = await fetch(url, options);
  if (res.status !== 200) throw new Error(res.statusText);
  const data = await res.json();
  const result = serializeData(data, host, port);
  return result;
};
