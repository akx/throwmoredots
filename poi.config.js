module.exports = (options, req) => ({
  homepage: './',
  removeDist: true,
  sourceMap: (options.mode !== 'production'),
});
