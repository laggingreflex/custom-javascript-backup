var os = require('os');

module.exports = path => {
  if (path.match(/^~/)) {
    path = os.homedir().join(path);
  }

  try {
    return require(path)
  } catch (error) {
    return {};
  }

}
