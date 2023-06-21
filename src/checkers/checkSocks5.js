'use strict';

const net = require('node:net');
const { getGeoInfo, getDuration } = require('../utils/');

const checkSocks5 = (proxy, cb) => {
  const socket = new net.Socket();
  const [host, port] = proxy.split(':');
  const nPort = parseInt(port);
  const timeout = 10000;

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

  const begin = getDuration();

  socket.connect(nPort, host, () => {
    clearTimeout(connectionTimeout);
    socket.write(socks5Handshake);
  });

  socket.on('data', (data) => {
    const [version, status] = data;
    if (version === 0x05 && status === 0x00) {
      const duration = getDuration(begin);
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
