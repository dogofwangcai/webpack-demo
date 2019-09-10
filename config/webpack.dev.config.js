var path = require('path')
var webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpackBaseConfig = require('./webpack.base.config')
const merge = require('webpack-merge');
const port = 9090;
function resolve(relatedPath) {
  return path.join(__dirname, relatedPath)
}
const webpackProd = {
  mode:'development',
  output: {
    //publicPath: './',
    filename: '[name].[hash].js',
  },
  devtool:'cheap-module-eval-source-map',
  devServer: {
    contentBase: resolve('../src'),
    // historyApiFallback: false,
    hot: true,
    host: 'localhost',
    port: port,
    open:true,
    overlay:{ 
      warnings: false, 
      errors: true 
    },
    watchOptions: {
      poll: true,
    }
  },
  plugins:[
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development'),
      IS_DEVELOPMETN: true,
    }),
    // 将打包后的资源注入到html文件内    
    new HtmlWebpackPlugin({
      // inject: true, // will inject the main bundle to index.html
      template: resolve('../index.html'),
      // mapConfig:'http://192.168.0.1/map_config.js',
      // 这里列出要加入html中的js文件
      dlls: [
        './dll/vendor.dll.js', 
      ],
    }),
    
   ]
};

module.exports = merge(webpackBaseConfig,webpackProd);