const Config = require('configucius').default;
const log = require('debug-any-level').config;
const OS = require('os');
const { cjbModule } = require('./utils');
const defaultConfig = require('./config.default.json');

const config = new Config({
  configFile: '~/.cjb',
  options: {
    root: {
      type: 'string',
      // default: defaultConfig.root,
      // prompt: true,
    },
  },
  duplicateArgumentsArray: false,
  mergeDefaults: true,
});

if (!config.root && config._.length) {
  config.root = config._.shift();
}

if (!config.root) {
  config.root = process.cwd();
}

if (config.root.match(/^~/)) {
  config.root = OS.homedir().join(config.root.substr(1));
}

module.exports = config;

// log.enable('*')
// log.silly(config.get());
