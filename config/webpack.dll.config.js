const webpack = require('webpack')
const path = require('path')
const ParallelUglifyPlugin = require('webpack-parallel-uglify-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin').CleanWebpackPlugin;


module.exports = {
  mode:'production',
  entry: {
    vendor: [
      'react', 
      'react-dom', 
    ],
  },
  output: {
    filename: '[name].dll.js',
    path: path.join(__dirname, '../src/dll'),
    library: '[name]_[hash]', 
  },
  plugins: [
    // 定义环境变量为开发环境
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
      IS_DEVELOPMETN: true,
    }),
    new CleanWebpackPlugin({
      root: path.join(__dirname, '../src/dll'),
      verbose:false,
      // exclude:['img']//不删除img静态资源
    }),
    // 使用插件 DllPlugin
    new webpack.DllPlugin({
      path: path.join(__dirname, '../src/dll', '[name].manifest.json'),
      // This must match the output.library option above
      name: '[name]_[hash]',
      context: __dirname
    }),
     new ParallelUglifyPlugin({
      cacheDir: '.cache/',
      uglifyJS:{
        output: {
          comments: false
        },
        warnings: false
      }
    }),
  ],
 
};