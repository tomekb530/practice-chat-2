const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    allowedHosts: [
      'localhost',
      'example.com',
      'local.tomekb530.me',
    ],
  },
  outputDir: '../dist',
})
