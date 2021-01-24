<template>
<!--  模板容器-->
  <el-container class="home-container">
<!--    头部-->
    <el-header>
      <div>
        <img src="../assets/logo.png" height="55" width="55"/>
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="loginOut">退出</el-button>
    </el-header>
      <!--主体-->
    <el-container>
      <!-- 主体左侧-->
      <!-- 宽度根据isCollapsed的值发生改变-->
      <el-aside :width="isCollapsed ?'64px':'200px'">
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <!-- 导航菜单-->
        <!-- :unique-opened是否只保持一个子菜单的展开;active-text-color激活状态的颜色;collapse是否水平折叠收起菜单;collapse-transition是否开启折叠动画-->
        <el-menu :unique-opened="true"
            background-color="#333744"
            text-color="#fff"
            active-text-color="#409eff"
                 :collapse="isCollapsed"
                 :collapse-transition="false"
                 :router="true"
                 :default-active="activePath">
          <!--active-text-color 激活的文本颜色；default-active当前激活菜单的index-->
            <!--   一级菜单-->
          <el-submenu :index="item.id + '' " v-for="item in menuList" :key="item.id">
              <!-- 一级菜单的模板区域-->
            <template slot="title">
                  <!-- 图标-->
              <i :class="iconObj[item.id]"></i>
                <!-- 文本-->
              <span>{{item.authName}}</span>
            </template>
                <!--一级菜单中的二级菜单-->
            <el-menu-item :index="'/'+ subItem.path+''"
                          v-for="subItem in item.children"
                          :key="subItem.id" @click="saveNavState('/'+ subItem.path+'')" >
              <template slot="title">
              <!-- 图标-->
              <i class="el-icon-menu"></i>
              <!-- 文本-->
              <span>{{subItem.authName}}</span>
            </template></el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
<!--      主体内容-->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
  export default {
    name: "Home",
    data(){
      return{
        menuList: [],
        //动态的改变图标
        iconObj:{
          '125':'el-icon-user-solid',
          '103':'el-icon-s-help',
          '101':'el-icon-s-goods',
          '102':'el-icon-shopping-cart-1',
          '145':'el-icon-s-data'
        },
        //默认不折叠
        isCollapsed:false,
        //动态的绑定default-active的值
        activePath:''
      }
    },
    methods:{
      //用删除token的思想；实现退出登录，只需删除sessionStorage中的token就好，在删除token的同时，使页面跳到login
      loginOut(){
        window.sessionStorage.clear()
        this.$router.push('/login')
      },
      //保存点击时当前的路由路径eg:（/user）
      saveNavState(activePath){
        window.sessionStorage.setItem('activePath',activePath)
        this.activePath=activePath
      },
      //获取菜单列表函数
     async getMenuList(){
       const {data:res} = await this.$http.get('menus')
       // console.log(res);
       if(res.meta.status!==200) return this.$message.error(res.meta.msg);
       this.menuList=res.data

     },
      //点击按钮；切换菜单的折叠与展开
      toggleCollapse(){
        this.isCollapsed=!this.isCollapsed;
      }
    },
    //初始化完成后调用这个函数
    created() {
      this.getMenuList();
      //得到本地保存的当前状态的路由
      this.activePath=window.sessionStorage.getItem('activePath')
    }
  }
</script>

<style scoped>
  .el-menu{
    border-right: 0;
  }
/*<!--  版心容器的高度默认是由内容撑开的;所以要手动设置一下高,使其占满整个区域-->*/
  .home-container{
    height: 100%;
  }
.el-header{
  background: #373d41;
  /*使盒子贴边对齐*/
  display: flex;
  justify-content:space-between;
  padding: 0;
  color: #fff;
  align-items: center;
  font-size: 20px;
}
.el-header>div{
  /*中线对齐*/
  display: flex;
  align-items: center;
}
.el-header>div span{
  margin-left: 15px;
}
  .el-aside{
    background: #333744;
  }
  .el-main{
    background: #eaedf1;
  }
  .toggle-button{
    background: #4a5064;
    font-size: 10px;
    line-height: 24px;
    color: #fff;
    text-align: center;
    letter-spacing: 0.2em;
    cursor: pointer;
  }
</style>