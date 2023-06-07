'use strict';

const net = require('node:net');
const { getGeoInfo, getDuration } = require('../utilities/');

const checkSocks5 = (proxy, cb) => {
  const timeout = 10000;
  const [host, port] = proxy.split(':');

  if (!host || !port) {
    const err = new Error('Host or port undefined!');
    cb(err);
    return;
  }

  const socket = new net.Socket();

  const socks5Handshake = Buffer.from([
    0x05, // Version SOCKS5
    0x01, // Number of authentication methods supported
    0x00 // No authentication
  ]);

  const connectionTimeout = setTimeout(() => {
    socket.destroy();
    const err = 'Socks5 connection timed out!';
    cb(err);
  }, timeout - 1);

  const startTime = getDuration();

  socket.connect(parseInt(port), host, () => {
    clearTimeout(connectionTimeout);
    socket.write(socks5Handshake);
  });

  socket.on('data', (data) => {
    const [version, status] = data;
    if (version === 0x05 && status === 0x00) {
      const duration = startTime();
      getGeoInfo(proxy)
        .then(
          (res) => {
            res.duration = duration;
            cb(null, res);
          },
          (reason) => cb(reason)
        )
        .catch((err) => cb(err));
    } else {
      const err = 'Socks5 connection failed!';
      cb(err);
    }
    socket.end();
  });

  socket.on('error', (err) => {
    socket.end();
    cb(err);
  });
};

module.exports = checkSocks5;
