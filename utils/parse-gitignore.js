const fs = require('fs-extra');
const gitignore = require('ignore');

module.exports = async(path, ig = gitignore()) => {
  try {
    return [null, ig.add(await fs.readFile(path, 'utf8'))];
  } catch (error) {
    return [error];
  }
}
