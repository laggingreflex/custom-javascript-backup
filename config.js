var Config = require('configucius').default;
var defaultConfig = require('./config.default.json');

const config = new Config({
  configFile: '~/.custom-backup',
  options: {
    root: {
      type: 'string',
      default: defaultConfig.root,
      prompt: true,
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

// console.log(`config:`, config.get());

module.exports = config;
