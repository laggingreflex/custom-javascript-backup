const untildify = require('untildify');
const gitignore = require('ignore');

module.exports = async(path, ig = gitignore()) => {
  try {
    return [null, ig.add(await fs.readFile(untildify(path), 'utf8'))];
  } catch (error) {
    return [error];
  }
}
