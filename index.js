require('pathify-string');
global.Promise = require('bluebird');
global.fs = require('fs-extra');
const log = require('debug-any-level');
const config = require('./config');
const walk = require('./walk');
const { handleError } = require('./utils');

// log.enable('*include*')
log.enable('*error*,*done*,' + config.log);
// log.enable('*error*')

walk(config.root).catch(log.error).then(() => log.done('Finished'));
