<template>
  <div>
    <el-button type="info" @click="loginOut">退出</el-button>
  </div>
</template>

<script>
  export default {
    name: "Home",
    methods:{
      //用删除token的思想；实现退出登录，只需删除sessionStorage中的token就好，在删除token的同时，使页面跳到login
      loginOut(){
        window.sessionStorage.clear()
        this.$router.push('/login')
      }
    }
  }
</script>

<style scoped>

</style>