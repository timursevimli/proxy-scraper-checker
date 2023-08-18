'use strict';

const net = require('node:net');
const { getGeoInfo, getDuration } = require('../utils/');

const checkSocks5 = (task, cb) => {
  const { proxy, timeout } = task;
  const [host, port] = proxy.split(':');
  const nPort = parseInt(port);

  const socks5Handshake = Buffer.from([
    0x05, // Version SOCKS5
    0x01, // Number of authentication methods supported
    0x00, // No authentication
  ]);

  const signal = AbortSignal.timeout(timeout);
  const socket = new net.Socket({ signal });

  const begin = getDuration();
  let duration = undefined;

  socket.connect(nPort, host, () => {
    duration = getDuration(begin);
    socket.write(socks5Handshake);
  });

  let res = undefined;
  let err = null;

  socket.on('error', (e) => void (err = e));
  socket.on('close', () => {
    if (err || res) return void cb(err, res);
    err = new Error('Socket closed for unknown reason!');
    cb(err, res);
  });

  socket.on('data', (data) => {
    const [version, status] = data;

    if (version !== 0x05 && status !== 0x00) {
      err = new Error('Socks5 connection failed!');
      return void socket.end();
    }

    const country = getGeoInfo(host);
    res = `SOCKS5 ${proxy} ${country} ${duration}`;
    socket.end();
  });
};

module.exports = checkSocks5;
