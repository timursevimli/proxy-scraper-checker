'use strict';
const config = require('dotenv').config;
const { join } = require('node:path');

config({ path: join(__dirname, '../..', '.env') });

const postgresConfig = {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
};

module.exports = postgresConfig;
