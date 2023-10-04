'use strict';

module.exports = {
  ...require('./http.js'),
  ...require('./https.js'),
  ...require('./socks4.js'),
  ...require('./socks5.js'),
};
