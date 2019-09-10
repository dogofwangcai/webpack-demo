const path = require('path');
const HappyPack = require('happypack');
const os = require('os');
const happyThreadPool = HappyPack.ThreadPool({ size: os.cpus().length });
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const webpack = require('webpack');
function resolve(relatedPath) {
  return path.join(__dirname, relatedPath)
}

const webpackConfigBase = {
  entry: {
    app: resolve('../src/app.js')
  },
  output: {
    path: resolve('../dist'),
    filename: '[name].[contenthash].js',
    chunkFilename: 'chunks/[name].[contenthash].js',
  },
  resolve: {
    extensions: ['.js', '.json'],
    alias: {
      '@src': path.join(__dirname, '../src')
    },
  },
  resolveLoader: {
    moduleExtensions: ['-loader']
  },
  module: {
    rules: [
      {
        test: /\.js[x]?$/,
        exclude: /node_modules/, 
        include: [resolve('../src')],
        //把对.js 的文件处理交给id为happyBabel 的HappyPack 的实例执行
        loader: 'happypack/loader?id=happyBabel',
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
         exclude: /node_modules/, 
        include: [resolve('../src/images')],
        loader: 'url',
        options: {
          limit: 8192,
          name: 'img/[name].[hash:4].[ext]'
        }
      },
      {
        test: /\.(woff|eot|ttf|svg|gif)$/,
        loader: 'url',
        options: {
          limit: 8192,
          name: 'font/[name].[hash:4].[ext]'
        }
      },
       {
        test: /\.css|less$/,  // 用正则去匹配要用该 loader 转换的 CSS 文件
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader'
        ]
      }
    ],
  },
  plugins:[
      new MiniCssExtractPlugin({
      　　filename: "[name].[contenthash:8].css",
          chunkFilename: "chunks/[name].[contenthash:8].css"
   　 }),
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
      // 关联dll拆分出去的依赖
      new webpack.DllReferencePlugin({
        manifest: require('../src/dll/vendor.manifest.json'), 
        context: __dirname, 
      }),
  ],
  optimization: {
    minimize:'process.env.NODE_ENV' === 'production' ? true : false, // 开发环境不压缩
    splitChunks: {
        chunks: "initial", // 共有三个值可选：initial(初始模块)、async(按需加载模块)和all(全部模块)
        minSize: 30000, // 模块超过30k自动被抽离成公共模块
        minChunks: 3, // 模块被引用>=1次，便分割
        maxAsyncRequests: 5,  // 异步加载chunk的并发请求数量<=5
        maxInitialRequests: 3, // 一个入口并发加载的chunk数量<=3
        name: true, // 默认由模块名+hash命名，名称相同时多个模块将合并为1个，可以设置为function
        automaticNameDelimiter: '~', // 命名分隔符
        cacheGroups: { // 缓存组，会继承和覆盖splitChunks的配置
            default: { // 模块缓存规则，设置为false，默认缓存组将禁用
                minChunks: 1, // 模块被引用>=2次，拆分至vendors公共模块
                priority: 20, // 优先级
                reuseExistingChunk: true, // 默认使用已有的模块
            },
        }
    }
  }
};
module.exports = webpackConfigBase