const Config = require('configucius').default;
const untildify = require('untildify');
const log = require('debug-any-level').config;
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

config.root = untildify(config.root)

module.exports = config;

// log.enable('*')
// log.silly(config.get());
