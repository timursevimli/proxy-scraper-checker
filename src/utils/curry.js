'use strict';

const curry = (fn, ...par) => {
  const curried = (...args) =>
    (fn.length > args.length ? curry(fn.bind(null, ...args)) : fn(...args));
  return par.length ? curried(...par) : curried;
};

module.exports = { curry };
