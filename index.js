require('pathify-string');
global.Promise = require('bluebird');
const log = require('debug-any-level');
const config = require('./config');
const walk = require('./walk');

log.enable('*')

walk(config.root, {
  onFile: async(f, dirConfig = {}) => {

    // console.log(f);
  },
  ...config.get(),
}).catch(log.error);
