import Vue from 'vue'
import App from './App.vue'
import router from './router/index'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css';
import './assets/iconfont/iconfont.css'
// import store from './store/index'
import TreeTable from 'vue-table-with-tree-grid'

import './css/global.css'

import axios from 'axios'
//配置请求的根路径
axios.defaults.baseURL = 'http://www.ysqorz.top:8888/api/private/v1/'
//设置请求拦截
axios.interceptors.request.use(config=>{
  //需要授权的 API ，必须在请求头中使用 `Authorization` 字段提供 `token` 令牌
  config.headers.Authorization=window.sessionStorage.getItem('token')

  return config
})




//将axios绑定到Vue属性的$http上面；使用$http请求即可
Vue.prototype.$http=axios

Vue.use(ElementUI)
// Vue.prototype.$confirm = MessageBox.confirm;
Vue.config.productionTip = false
//注册为全局可用的组件
Vue.component('tree-table',TreeTable)

new Vue({
  router,
  // store,
  render: h => h(App),
}).$mount('#app')
