
import Vue from "vue"
import VueRouter from "vue-router"

import Login from '../components/Login'

Vue.use(VueRouter)


const routes=[
  {
    path:'/',
    redirect:'/login'
  },
  {
    path:"/login",
    component:Login
  },
  {
    path:'/home',
    component:()=>import('../components/Home'),
    redirect:'/welcome',
    children:[
      {
        path:'/welcome',
        component:()=>import('../components/Welcome')
      },
      {
        path:'/users',
        component:()=>import('../components/user/Users')
      },
      {
        path:'/rights',
        component:()=>import('../components/power/Rights')
      },
      {
        path:'/roles',
        component:()=>import('../components/power/Roles')
      },
      {
        path:'/categories',
        component:()=>import('../components/goods/Cate')
      },
    ]
  }
]


const router=new VueRouter({
  routes,
  mode:"history"
})

//挂载路由导航守卫
router.beforeEach((to,from,next)=>{
  //next();直接放行，next('/home')强制跳转
  if(to.path === '/login') return next();
  //如果有token值就代表有用户登录，则放行，否则没有用户登录，不放行
  const tokenStr = window.sessionStorage.getItem('token')
  //如果没有token值，则强制跳到login
  if(!tokenStr) return next('/login')
  next()
})

export default router