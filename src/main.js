import Vue from 'vue'
import App from './App.vue'
import router from './router/index'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css';
import './assets/iconfont/iconfont.css'
// import store from './store/index'

import './css/global.css'

import axios from 'axios'
//配置请求的根路径
axios.defaults.baseURL='http://timemeetyou.com:8889/api/private/v1/'
Vue.prototype.$http=axios

Vue.use(ElementUI)
Vue.config.productionTip = false

new Vue({
  router,
  // store,
  render: h => h(App),
}).$mount('#app')
