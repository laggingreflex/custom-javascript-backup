const fs = require('fs-extra');
const { camel } = require('case');

module.exports = fs
  .readdirSync(__dirname)
  .filter(f => f.match(/\.js$/))
  .map(f => f.replace('.js', ''))
  .reduce(
    (exports, module) => ({
      [camel(module)]: require(`./${module}`),
      ...exports
    }), {});
