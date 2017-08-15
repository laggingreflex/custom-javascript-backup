module.exports = function handleError(preMessage = '', error = { message: '' }, opts = {}, log = require('debug-any-level').error) {
  error.message = preMessage + error.message
  if (opts.halt) {
    throw error;
  } else if (!opts.silent) {
    log(error.message);
  }
}
