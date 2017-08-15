const _ = require('lodash');

module.exports = fs
  .readdirSync(__dirname)
  .filter(f => f.match(/\.js$/))
  .map(f => f.replace('.js', ''))
  .reduce(
    (exports, module) => ({
      [_.camelCase(module)]: require(`./${module}`),
      ...exports
    }), {});
