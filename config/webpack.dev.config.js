var path = require('path')
var webpack = require('webpack');
const HappyPack = require('happypack');
const os = require('os');
const happyThreadPool = HappyPack.ThreadPool({ size: os.cpus().length });
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ParallelUglifyPlugin = require('webpack-parallel-uglify-plugin')
const Copy = require('copy-webpack-plugin')
const webpackBaseConfig = require('./webpack.base.config')
const CleanWebpackPlugin = require('clean-webpack-plugin').CleanWebpackPlugin;
const merge = require('webpack-merge')
function resolve(relatedPath) {
  return path.join(__dirname, relatedPath)
}
const webpackProd = {
  mode:'production',
  output: {
    publicPath: './',
  },
  plugins:[
    new HappyPack({
        //用id来标识 happypack处理那里类文件
        id: 'happyBabel',
        //如何处理  用法和loader 的配置一样
        loaders: [{
          loader: 'babel?cacheDirectory=true',
        }],
        //代表共享进程池，即多个 HappyPack 实例都使用同一个共享进程池中的子进程去处理任务，以防止资源占用过多。
        threadPool: happyThreadPool,
        //允许 HappyPack 输出日志
        verbose: true,
    }),
    new webpack.DllReferencePlugin({
      manifest: require('../src/dll/vendor.manifest.json'), 
      context: __dirname, 
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
      IS_DEVELOPMETN: false,
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
    new Copy([
      { from: './src/dll', to: '../dist/dll' },
    ]),
    new CleanWebpackPlugin({
      root: path.join(__dirname, '../'),
      verbose:false,
      // exclude:['img']//不删除img静态资源
    }),
    /* 多核压缩代码 */
    new ParallelUglifyPlugin({
      cacheDir: '.cache/',
      uglifyJS:{
        output: {
          comments: false
        },
        warnings: false
      }
    }),
   ]
};

module.exports = merge(webpackBaseConfig,webpackProd);