module.exports = {
  devServer: {
    host: '127.0.0.1',
    port: 8080
  },
  chainWebpack: config => {
    // 发布
    config.when(process.env.NODE_ENV === 'production', config => {
      config
        .entry('app')
        .clear()
        .add('./src/main-prod.js')
      config.set('externals', {
        vue: 'vue',
        'vue-router': 'VueRouter',
        axios: 'axios',
        lodash: '_',
        echarts: 'echarts',
        nprogress: 'NProgress',
        'vue-quill-editor': 'VueQuillEditor'
      })

      config
        .plugin('html')
        .tap(args => {
          args[0].isProd = true
          return args
        })
    })
    config.when(process.env.NODE_ENV === 'development', config => {
      // 开发
      config
        .entry('app')
        .clear()
        .add('./src/main-dev.js')

      config
        .plugin('html')
        .tap(args => {
          args[0].isProd = false
          return args
        })
    })
  }
}
