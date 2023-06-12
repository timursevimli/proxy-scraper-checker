'use strict';

class Collector {
  constructor(expected) { // number or array of string, count or keys
    this.expectKeys = Array.isArray(expected) ? new Set(expected) : null;
    this.expected = this.expectKeys ? expected.length : expected;
    this.keys = new Set();
    this.count = 0;
    this.timer = null;
    this.doneCallback = () => { };
    this.finished = false;
    this.data = {};
    this.errors = {};
  }

  collect(key, err, value) {
    if (this.finished) return this;
    if (!this.keys.has(key)) {
      this.count++;
    }
    this.keys.add(key);
    if (err) {
      this.errors[key] = err;
    } else {
      this.data[key] = value;
    }
    if (this.expected === this.count) {
      this.finalize(this.errors, this.data);
    }
    return this;
  }

  pick(key, value) {
    this.collect(key, null, value);
    return this;
  }

  fail(key, err) {
    this.collect(key, err);
    return this;
  }

  take(key, fn, ...args) {
    fn(...args, (err, data) => {
      this.collect(key, err, data);
    });
    return this;
  }

  timeout(msec) {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (msec > 0) {
      this.timer = setTimeout(() => {
        const err = new Error('Collector timed out');
        this.finalize(err, this.data);
      }, msec);
    }
    return this;
  }

  done(callback) {
    this.doneCallback = callback;
    return this;
  }

  finalize(err, data) {
    if (this.finished) return this;
    if (this.doneCallback) {
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }
      this.finished = true;
      this.doneCallback(err, data);
    }
    return this;
  }
}
module.exports = Collector;
