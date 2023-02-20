const path = require('path')
const resolve = dir => path.join(__dirname, dir)
const webpack = require('webpack')

require('events').EventEmitter.defaultMaxListeners = 20

var dateTemp = new Date()
var version = dateTemp.getFullYear() + '-' + (dateTemp.getMonth() + 1) + '-' + dateTemp.getDate() + '_' + dateTemp.getHours() + dateTemp.getMinutes()
dateTemp = null

const CompressionWebpackPlugin = require('compression-webpack-plugin')
const productionGzipExtensions = /\.(js|css)(\?.*)?$/i

module.exports = {
  lintOnSave: false,
  productionSourceMap: false,
  publicPath: './',
  outputDir: './dist',
  devServer: {
    port: 8888
  },
  chainWebpack: config => {
    // 修复热更新失效
    config.resolve.symlinks(true)
    // 别名
    config.resolve.alias.set('@', resolve('src')).set('#', resolve('src/assets'))
    // 移除prefetch
    config.plugins.delete('prefetch')

    config.output.filename(`js/[id].${version}.js`)
    config.output.chunkFilename(`js/[id].${version}.js`)

    config.plugin('ignore').use(new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /zh-cn$/))

    // set svg-sprite-loader
    config.module
      .rule('svg')
      .exclude.add(resolve('src/icons'))
      .end()
    config.module
      .rule('icons')
      .test(/\.svg$/)
      .include.add(resolve('src/icons'))
      .end()
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({
        symbolId: 'icon-[name]'
      })
      .end()
  },
  configureWebpack: config => {
    const plugins = []
    config.plugins = [...config.plugins, ...plugins]
  },
  css: {
    loaderOptions: {
      sass: {
      }
    }
  }
}
