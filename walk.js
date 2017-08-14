const fs = require('fs-extra');
const { isMatch } = require('matcher');
const log = require('debug-any-level').walk;
const { arrifyExcludes } = require('./utils');
const config = require('./config');

module.exports = async function walk(dir, { dirConfig = {}, ...opts } = {}) {
  let files;
  try {
    files = await fs.readdir(dir);
  } catch (error) {
    return handleError(`Couldn't read dir '${dir}': `, error, opts);
  }

  opts.exclude = arrifyExcludes(opts.exclude);
  opts.excludeFile = arrifyExcludes(opts.excludeFile);
  opts.excludeDir = arrifyExcludes(opts.excludeDir);

  return Promise.map(files
    .filter(f => !['.', '..'].includes(f))
    .map(f => dir.join(f)),
    async f => {
      let exclude
      if (exclude = opts.exclude && opts.exclude.find(e => isMatch(f, e))) {
        log.verbose(`Excluding '${f}' (matches {exclude: '${exclude}'})`);
        return;
      }
      let stats;
      try {
        stats = await fs.stat(f);
      } catch (error) {
        return handleError(`Couldn't stat '${f}': `, error, opts);
      }
      if (stats.isFile()) {
        let exclude;
        if (exclude = opts.excludeFile && opts.excludeFile.find(e => isMatch(f, e))) {
          log.verbose(`Excluding file '${f}' (matches {excludeFile: '${exclude}'})`);
          return;
        }
        log.verbose(`Processing file '${f}'`);
        try {
          return opts.onFile(f, dirConfig);
        } catch (error) {
          return handleError(`Couldn't process file '${f}': `, error, opts);
        }
      } else if (stats.isDirectory()) {
        let exclude;
        if (exclude = opts.excludeDir && opts.excludeDir.find(e => isMatch(f, e))) {
          log.verbose(`Excluding dir '${f}' (matches {excludeDir: '${exclude}'})`);
          return;
        }
        log.verbose(`Processing dir '${f}'`);
        let dirConfig
        try {
          dirConfig = await fs.readFile(f.join('.custom-backup'))
        } catch (error) {
          log.silly(`Couldn't find '.custom-backup' in '${f}'`);
        }
        try {
          return walk(f, { ...opts, dirConfig });
        } catch (error) {
          return handleError(`Couldn't process dir '${f}': `, error, opts);
        }
      } else {
        return handleError(`Unexpected type '${f}'`, null, opts);
      }
    }, { concurrency: opts.concurrency || 2 }
  );

}


function handleError(preMessage = '', error = { message: '' }, opts = {}) {
  error.message = preMessage + error.message
  if (opts.halt) {
    throw error;
  } else if (!opts.silent) {
    log.error(error.message);
  }
}
