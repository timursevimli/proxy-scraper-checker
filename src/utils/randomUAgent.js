'use strict';
const getSource = require('./getSource.js');
const userAgents = getSource('user_agents.txt');
module.exports = () =>
  userAgents[Math.floor(Math.random() * userAgents.length - 1)];
