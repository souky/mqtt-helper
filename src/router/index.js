import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

var router = new Router({
  mode: 'hash',
  routes: [
    {
      path: '/',
      name: 'home',
      component: (resolve) => require(['@/views/home/index.vue'], resolve)
    },
  ]
})
export default router
