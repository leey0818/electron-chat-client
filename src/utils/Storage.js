const electron = require('electron');
const path = require('path');
const fs = require('fs');

function parseFile(filePath, defaults) {
  try {
    return JSON.parse(fs.readFileSync(filePath));
  } catch (e) {
    return defaults;
  }
}

/**
 * Electron 내부 저장소
 * @class
 * @example
 * const storage1 = new Storage();
 * const storage2 = new Storage({ configName: 'app' });
 */
class Storage {
  constructor(opts) {
    const userDataPath = (electron.app || electron.remote.app).getPath('userData');

    this.path = path.join(userDataPath, `${opts.configName}.json`);
    this.data = parseFile(this.path, opts.defaults || {});
  }

  get(key) {
    return this.data[key];
  }

  set(key, value) {
    this.data[key] = value;

    fs.writeFileSync(this.path, JSON.stringify(this.data, null, '  '));
  }

  remove(key) {
    delete this.data[key];

    fs.writeFileSync(this.path, JSON.stringify(this.data, null, '  '));
  }

  has(key) {
    return typeof this.data[key] !== 'undefined';
  }
}

module.exports = Storage;
