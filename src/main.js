import Vue from 'vue'
import App from './App.vue'
import VueRouter from 'vue-router'
import router from './router'
// 加载工具类
import Tools from '@/utils/tools.js'

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
Vue.use(ElementUI)

import '@/styles/index.scss' // global css


Vue.config.productionTip = false

import Components from '@/hoComponents/index.js'
for (const x in Components) {
  Vue.use(Components[x])
}

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
