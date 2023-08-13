'use strict';

const net = require('node:net');
const { getGeoInfo, getDuration } = require('../utils/');

const checkSocks4 = (task, cb) => {
  const { proxy, timeout } = task;
  const [host, port] = proxy.split(':');
  const nPort = parseInt(port);

  const socks4Handshake = Buffer.from([
    0x04, // Version SOCKS4
    0x01, // Command CONNECT
    nPort >> 8,
    nPort & 0xff, // Port divided 2 Byte
    0x00,
    0x00,
    0x00,
    0x01, // ipAdress - 0.0.0.1
    0x00, // UserId (empyt)
  ]);

  const signal = AbortSignal.timeout(timeout);
  const socket = new net.Socket({ signal });

  const begin = getDuration();
  let duration = undefined;

  socket.connect(nPort, host, () => {
    duration = getDuration(begin);
    socket.write(socks4Handshake);
  });

  let res = undefined;
  let err = null;

  socket.on('error', (e) => void (err = e));
  socket.on('close', () => {
    if (err || res) return void cb(err, res);
    err = new Error('Socket closed for unknown reason!');
    cb(err, res);
  });

  socket.on('data', async (data) => {
    const [version, status] = data;

    if (version !== 0x00 && status !== 0x5a) {
      err = new Error('Socks4 connection failed!');
      return void socket.end();
    }

    try {
      const geoInfo = await getGeoInfo(proxy);
      res = `SOCKS4 ${geoInfo} ${duration}`;
    } catch (e) {
      err = e;
    } finally {
      socket.destroy();
    }
  });
};

module.exports = checkSocks4;
