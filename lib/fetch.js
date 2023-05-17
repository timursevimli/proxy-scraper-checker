'use strict';
const http = require('node:http');
const https = require('node:https');
const PROTOCOL = { 'https:': https, 'http:': http };
module.exports = (
  hostname,
  method,
  timeout,
  headers
) => new Promise((resolve, reject) => {
  if (!hostname || !method) {
    const err = new Error('Using url and method params!');
    reject(err);
  }
  let timer = null;
  if (timeout && timeout > 0) {
    const err = new Error('Fetch timeout!');
    timer = setTimeout(reject, timeout, err);
  }
  const url = new URL(hostname);
  const options = {
    hostname: url.hostname,
    port: url.protocol === 'http:' ? 80 : 443,
    method,
    headers: headers || {
      'Content-Type': 'application/json',
    },
  };
  const chunks = [];
  const protocol = PROTOCOL[url.protocol];
  const req = protocol.request(options, (res) => {
    res.on('data', (chunk) => {
      chunks.push(chunk);
    });
    res.on('end', () => {
      const buffer = Buffer.concat(chunks).toString();
      resolve(buffer);
    });
    res.on('error', (e) => {
      reject(e);
    });
  });
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  req.end();
});
