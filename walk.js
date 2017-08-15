const _ = require('lodash');
const { isMatch } = require('matcher');
const log = require('debug-any-level').walk;
const { arrifyExcludes, handleError, parseGitignore } = require('./utils');
const config = require('./config');

const homeGitIgnore = parseGitignore('~/.gitignore');

module.exports = async function walk(dir, opts = {}) {

  const rootRelativeDir = config.root.relative(dir);

  let dirConfig, dirConfigError, dirIgnore, dirIgnoreConfigFile, dirIgnoreConfigDir, dirIgnoreError;

  const configFile = dir.join('.cjb');
  let rootRelativeConfigFile = rootRelativeDir.join('.cjb');

  try {
    dirConfig = config.readConfigFile.call({}, configFile, { silent: true });
  } catch (error) {
    error.message = `Couldn't find dirConfig '${rootRelativeConfigFile}'. ` + error.message;
    dirConfigError = error;
  }
  if (dirConfig) {
    log.verbose(`dirConfig:`, dirConfig, typeof dirConfig);
  } else {
    [dirIgnoreError, dirIgnore] = await parseGitignore(configFile);
    if (dirIgnoreError) {
      dirIgnoreError.message = `Couldn't find/parse dirIgnore '${rootRelativeConfigFile}'. ` + dirIgnoreError.message
    } else {
      dirIgnoreConfigDir = dir;
      dirIgnoreConfigFile = configFile;
    }
  }

  if (!dirIgnore) {
    const actualGitignoreFile = dir.join('.gitignore');
    [dirIgnoreError, dirIgnore] = await parseGitignore(actualGitignoreFile);
    if (dirIgnoreError) {
      dirIgnoreError.message = `Couldn't find/parse .gitignore '${config.root.relative(actualGitignoreFile)}'. ` + dirIgnoreError.message
    } else {
      dirIgnoreConfigDir = dir;
      dirIgnoreConfigFile = actualGitignoreFile;
    }
  }


  if (!dirConfig && !dirIgnore) {
    if (dirConfigError) {
      log.silly(dirConfigError.message)
    }
    if (dirIgnoreError) {
      log.silly(dirIgnoreError.message)
    }
  }

  opts = Object.assign({}, config.get(), opts, dirConfig, _.pickBy({
    dir,
    rootRelativeDir,
    dirIgnore,
    dirIgnoreConfigDir,
    dirIgnoreConfigFile,
    rootRelativeConfigFile,
  }, Boolean));

  opts.exclude = arrifyExcludes(opts.exclude);
  opts.excludeFile = arrifyExcludes(opts.excludeFile);
  opts.excludeDir = arrifyExcludes(opts.excludeDir);
  opts.include = arrifyExcludes(opts.include);
  opts.includeFile = arrifyExcludes(opts.includeFile);
  opts.includeDir = arrifyExcludes(opts.includeDir);

  let files;
  try {
    files = await fs.readdir(dir);
  } catch (error) {
    return handleError(`Couldn't read dir '${dir}': `, error, opts, log.error);
  }

  return Promise.map(files
    .filter(f => !['.', '..'].includes(f))
    .map(f => dir.join(f)),
    async fullFilePath => {
      if (opts.delay) {
        await Promise.delay(opts.delay);
      }
      const filename = dir.relative(fullFilePath);
      const rootRelativeFilePath = config.root.relative(fullFilePath);
      let exclude;
      if (exclude = opts.exclude && opts.exclude.find(e => isMatch(fullFilePath, e))) {
        log.exclude.verbose(`Excluding '${rootRelativeFilePath}' (matches {exclude: '${exclude}'})`);
        return;
      }
      if (exclude = opts.dirIgnore && opts.dirIgnore.ignores(opts.dirIgnoreConfigDir.relative(fullFilePath))) {
        log.exclude.verbose(`Excluding '${rootRelativeFilePath}' (ignored in '${opts.dirIgnoreConfigFile}')`);
        return;
      }
      if (exclude = homeGitIgnore && homeGitIgnore.ignores(filename)) {
        log.exclude.verbose(`Excluding '${rootRelativeFilePath}' (ignored in '~/.gitignore')`);
        return;
      }
      if (opts.include && !opts.include.find(e => isMatch(fullFilePath, e))) {
        log.exclude.verbose(`Excluding '${rootRelativeFilePath}' (doesn't match {include: [${opts.include}]})`);
        return;
      }
      let stats;
      try {
        stats = await fs.stat(fullFilePath);
      } catch (error) {
        return handleError(`Couldn't stat '${rootRelativeFilePath}': `, error, opts, log.error);
      }
      if (stats.isFile()) {
        log.include.verbose(`Processing file '${rootRelativeFilePath}'`);
        if (opts.onFile) {
          try {
            return opts.onFile(fullFilePath, opts);
          } catch (error) {
            return handleError(`Couldn't operate \`onFile\` on file '${rootRelativeFilePath}': `, error, opts, log.error);
          }
        }
      } else if (stats.isDirectory()) {
        log.include.verbose(`Processing dir '${rootRelativeFilePath}'`);
        try {
          return walk(fullFilePath, { ...opts, last: opts });
        } catch (error) {
          return handleError(`Couldn't process dir '${rootRelativeFilePath}': `, error, opts, log.error);
        }
      } else {
        return handleError(`Unexpected type '${rootRelativeFilePath}'`, undefined, opts, log.error);
      }
    }, { concurrency: opts.concurrency || 1 }
  );

}
