<template>
  <div class="login">
    <div class="login_box">
<!--      头像-->
      <div class="login_img">
        <img src="../assets/logo.png" alt="">
      </div>
<!--      表单  loginfromRef 表单的实例对象;loginfromRules验证规则对象-->
      <el-form ref="loginfromRef" :model="loginfrom" :rules="loginfromRules" label-width="0px" class="login_from">
<!--        用户名    prop="username"验证规则加给item-->
        <el-form-item prop="username">
          <el-input v-model="loginfrom.username" prefix-icon="iconfont icon-user"></el-input>
        </el-form-item>
<!--        密码-->
        <el-form-item prop="password">
          <el-input type="password" v-model="loginfrom.password" prefix-icon="iconfont icon-user"></el-input>
        </el-form-item>
<!--按钮-->
        <el-form-item class="btns">
          <el-button type="primary" @click="loginbtn">登录</el-button>
          <el-button type="info" @click="resetloginfrom">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
  export default {
    name: "Login",
    data(){
      return{
        //这是登录表单的数据绑定对象
        loginfrom:{
          username:"admin",
          password:"123456"
        },
        //表单的验证规则对象
        loginfromRules:{
          //验证用户名是否合法
          username:[
              //required:为必填项；message:不符合规则显示的提示消息；trigger:失去焦点的时候触发这个验证
            { required: true, message: '请输入用户名', trigger: 'blur' },
              //长度在3-10之间
            { min: 3, max:10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
          ],
          //验证密码是否合法
          password:[
            { required: true, message: '请输入密码', trigger: 'blur' },
            { min:6, max:15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
          ]
        }
      }
    },
    methods:{
      //点击重置按钮，重置表单
      resetloginfrom(){
        // this 组件的实例对象
        //重置表单的验证规则
        this.$refs.loginfromRef.resetFields();
      },
      loginbtn(){
        //表单的预验证；通过定义的loginfromRef引用对象.validate实现对表单的预验证；参数为一个回调函数；当表单验证成功会自动调用这个回调函数；返回值为promise对象
        this.$refs.loginfromRef.validate(async valid=>{
          //当验证通过时valid的返回值为true，不通过时返回值为false
          // console.log(valid);
          if(!valid) return;
          //this.loginfrom是一个对象；
          //简化promise；当不加await和async时，返回的是一个promise对象，加了await和async后，返回的是一个data对象
          //{data:res}结构赋值     （this.$http.post）发起登录请求；第一个参数为接口，第二个参数为一个对象
          const {data:res}=await this.$http.post('login',this.loginfrom)
          //res返回一个data对象{data:,meta:{msg:,status:}}，里面有两条数据，一条data，一个meta{msg:,status:,} msg判断用户是否存在，status判断状态码
          // console.log(res);

          //根据状态码判断用户是否登录成功；如果成功则发送请求，失败则不请求
          if(res.meta.status!==200) return this.$message.error("用户名或密码错误");
          this.$message.success("登录成功")

          //在向后台请求的时候会得到一个token值，将这个token只保存到sessionStorage中（项目中出现了登录之外的其他API接口，必须在登录之后才能访问；而且token只需用在当前页面内）
          window.sessionStorage.setItem('token',res.data.token);
          //当验证成功，并得到token值后跳到home页面
          this.$router.push('/home');

        })
      }
    }
  }
</script>

<style scoped>
.login{
  background: #2b4b6b;
  height: 100%;
}
  .login_box{
    width: 450px;
    height: 300px;
    background: #fff;
    position: absolute;
    left: 50%;
    top: 50%;
    margin-left: -225px;
    margin-top: -150px;
    border-radius: 3px;
  }
  .login_img{
    height: 130px;
    width: 130px;
    border: 1px solid #eee;
    border-radius: 50%;
    padding: 10px;
    box-shadow: 0 0 10px #ddd;
    position: absolute;
    left: 50%;
    margin-left: -65px;
    margin-top: -65px;
    background: #fff;
  }
.login_img img{
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: #eee;
}
  .btns{
    float: right;
  }
  .login_from{
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: 0 20px;
    box-sizing: border-box;
  }
</style>