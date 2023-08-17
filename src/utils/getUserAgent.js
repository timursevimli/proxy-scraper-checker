'use strict';

const getSourceSync = require('./getSourceSync.js');
const userAgents = getSourceSync('user_agents.txt');

const max = userAgents.length - 1;
const random = () => Math.floor(Math.random() * max);

module.exports = () => userAgents[random()];
