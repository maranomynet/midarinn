var noderesolve = require('rollup-plugin-node-resolve');
var commonjs = require('rollup-plugin-commonjs');

module.exports = {
  format: 'iife',
  sourceMap: true,
  plugins: [
    noderesolve({
      jsnext: true,
    }),
    commonjs({
      // ignoreGlobal: true,
      // sourceMap: true,
    }),
  ],
};
