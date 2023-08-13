'use strict';

const fs = require('node:fs');
const util = require('node:util');
const path = require('node:path');

const logPath = path.join(process.cwd(), './logs');

const COLORS = {
  info: '\x1b[1;37m',
  debug: '\x1b[1;33m',
  error: '\x1b[0;31m',
  system: '\x1b[1;34m',
};

const DATETIME_LENGTH = 19;

class Logger {
  #logFileStream;

  constructor(logPath) {
    this.path = logPath;
    this.date = new Date().toISOString().substring(0, 10);
    this.#logFileStream = null;
    this.#createFileStream();
  }

  #createFileStream() {
    if (this.#logFileStream) this.#logFileStream.end();
    const filePath = path.join(this.path, `${this.date}.log`);
    this.#logFileStream = fs.createWriteStream(filePath, { flags: 'a' });
  }

  close() {
    return new Promise((resolve) => this.#logFileStream.end(resolve));
  }

  write(type = 'info', s, showLog) {
    const currentDate = new Date().toISOString().substring(0, 10);
    if (currentDate !== this.date) {
      this.date = currentDate;
      this.#createFileStream();
    }
    const now = new Date().toISOString();
    const date = now.substring(0, DATETIME_LENGTH);
    if (showLog) {
      const level = type.toUpperCase();
      const line = `${date} [${level}] \t ${s}`;
      console.log(COLORS[type] + line + '\x1b[0m');
      return;
    }
    const line = `${date} \t ${s}`;
    const out = line.replace(/[\n\r]\s*/g, ' ') + '\n';
    this.#logFileStream.write(out);
  }

  show(type = 'info', ...args) {
    const msg = util.format(...args);
    const showLog = true;
    this.write(type, msg, showLog);
  }

  log(...args) {
    const msg = util.format(...args);
    this.write('info', msg);
  }

  dir(...args) {
    const msg = util.inspect(...args);
    this.write('info', msg);
  }

  error(...args) {
    const msg = util.format(...args);
    this.write('error', msg);
  }

  debug(...args) {
    const msg = util.format(...args);
    this.write('debug', msg);
  }

  system(...args) {
    const msg = util.format(...args);
    this.write.info('system', msg);
  }
}

module.exports = Object.freeze(new Logger(logPath));