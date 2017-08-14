module.exports = function arrifyExcludes(excludes) {
  if (excludes && !Array.isArray(excludes)) {
    if (excludes.includes(',')) {
      excludes = excludes.split(/,/g);
    } else {
      excludes = [excludes];
    }
  }
  return excludes;
}
