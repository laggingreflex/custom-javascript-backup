const fs = require('fs-extra');
const { isMatch } = require('matcher');
const log = require('debug-any-level').walk;

module.exports = async function walk(dir, { dirConfig = {}, ...opts } = {}) {
  let files;
  try {
    files = await fs.readdir(dir);
  } catch (error) {
    return handleError(`Couldn't read dir '${dir}': `, error, opts);
  }

  if (opts.exclude && !Array.isArray(opts.exclude)) {
    if (opts.exclude.includes(',')) {
      opts.exclude = opts.exclude.split(/,/g);
    } else {
      opts.exclude = [opts.exclude];
    }
  }

  return Promise.map(files
    .filter(f => !['.', '..'].includes(f))
    .map(f => dir.join(f)),
    async f => {
      if (opts.exclude && opts.exclude.some(e => isMatch(f, e))) {
        log.verbose(`Excluding '${f}'`);
        return;
      }
      let stats;
      try {
        stats = await fs.stat(f);
      } catch (error) {
        return handleError(`Couldn't stat '${f}': `, error, opts);
      }
      if (stats.isFile()) {
        log.verbose(`Processing file '${f}'`);
        try {
          return opts.onFile(f, dirConfig);
        } catch (error) {
          return handleError(`Couldn't process file '${f}': `, error, opts);
        }
      } else if (stats.isDirectory()) {
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
