'use strict';

const dateParser = (date = new Date()) => date.toISOString().split('T')[0];
const timeParser = (date = new Date()) => {
  const time = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  return time.startsWith('24') ? time.replace('24', '00') : time;
};

module.exports = { dateParser, timeParser };
