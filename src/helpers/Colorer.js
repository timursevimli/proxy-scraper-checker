'use strict';
class Colorer {
  static black(text) {
    return ` \x1b[30m${text}\x1b[0m `;
  }
  static red(text) {
    return ` \x1b[31m${text}\x1b[0m `;
  }
  static green(text) {
    return ` \x1b[32m${text}\x1b[0m `;
  }
  static yellow(text) {
    return ` \x1b[33m${text}\x1b[0m `;
  }
  static blue(text) {
    return ` \x1b[34m${text}\x1b[0m `;
  }
  static magenta(text) {
    return ` \x1b[35m${text}\x1b[0m `;
  }
  static cyan(text) {
    return ` \x1b[36m${text}\x1b[0m `;
  }

}
module.exports = Colorer;
