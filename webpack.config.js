var path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist', 'umd'),
    filename: 'god-state.js',
    library: 'GodState',
    libraryTarget: 'umd'
  },
  mode: process.env.NODE_ENV,
  module: {
    rules: [
      { test: /\.js$/, loaders: ['babel-loader'], exclude: /node_modules/ }
    ]
  },
   externals: {
     react: {
       commonjs: 'react',
       commonjs2: 'react',
       amd: 'react',
       root: 'React'
     },
   }
}