<template>
  <div>
    <!--面包屑导航区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片试图区 -->
    <el-card>
      <!--搜索与添加区-->
      <el-row :gutter="20">
        <el-col :span="7">
          <!--@clear  在点击由 clearable 属性生成的清空按钮时触发-->
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary"  @click="addDialogVisible=true">添加用户</el-button>
        </el-col>
      </el-row>
    <!--添加用户列表信息-->
    <!--:data：数组名；-->
      <el-table :data="userList" border stripe>
        <!--el-table-column：一列;prop：数组中的对象名；label：列名； -->
        <el-table-column type="index" label="索引"></el-table-column><!--索引列-->
        <el-table-column prop="username" label="姓名"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <!-- 状态是一个布尔值，不可以直接得到，所以使用slot-scope="scope"和 {{scope.row.mg_state}}得到一个布尔值-->
        <el-table-column label="状态">
        <!-- scope.row:直接取到当期单元格对象-->
          <!--作用域插槽得到当前行的数据；作用域插槽会覆盖prop-->
          <template slot-scope="scope">
         <!-- {{scope.row.mg_state}}-->
            <!--一个开关按钮；把scope.row.mg_state中的布尔值通过开关显示出来 @userStateChanged:改变用户的状态-->
            <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <!--通过ID对用户进行操作-->
          <template slot-scope="scope" width="300px">
<!--            {{scope.row.id}}-->
            <!--修改按钮-->
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
            <!--删除按钮-->
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUserById(scope.row.id)"></el-button>
            <!--分配角色按钮-->
            <!--el-tooltip当鼠标放在按钮上的时候，会有提示信息 enterable:鼠标是否可进到提示信息中，默认是可以的-->
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini"  @click="setRole(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!--分页功能的实现-->
      <!--layout：展示的功能列表 @size-change="handleSizeChange"：监听page-sizes改变的事件
      @current-change="handleCurrentChange"：监听页码值的改变事件
      current-change：当前显示的页数 current-page：每页显示的数据 total：共有多少条数据-->
      <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryInfo.pagenum"
          :page-sizes="[1, 2, 5,10]"
          :page-size="queryInfo.pagesize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
      </el-pagination>
    </el-card>
    <!--添加用户的对话框-->
    <!--:visible.sync="addDialogVisible"一个属性；实现对话框的显示和隐藏;当等于false时隐藏-->
    <el-dialog
        title="添加用户"
        :visible.sync="addDialogVisible"
        width="50%" @close="addDialogClosed">
      <!--内容主体区域-->
      <!--添加用户 :model="addFrom"验证绑定；:rules="addFromRules"验证规则-->
      <el-form :model="addFrom" :rules="addFromRules" ref="addFromRef" label-width="70px">
        <el-form-item label="用户名" prop="userName">
          <el-input v-model="addFrom.userName"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addFrom.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addFrom.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addFrom.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!--底部按钮区-->
      <span slot="footer" class="dialog-footer">
    <el-button @click="addDialogVisible=false">取 消</el-button>
    <el-button type="primary" @click="addUser">确 定</el-button>
    </span>
    </el-dialog>
    <!--修改用户的对话框-->
    <el-dialog
        title="修改用户信息"
        :visible.sync="editDialogVisible"
        width="50%" @close="editDialogClose">
      <el-form ref="editFormRef" :model="editForm" :rules="editFormRules" label-width="70px">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email" hide-required-asterisk></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="editForm.mobile" hide-required-asterisk></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="editDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="editUserInfo">确 定</el-button>
  </span>
    </el-dialog>
    <!--分配权限的对话框-->
    <el-dialog
        title="分配权限"
        :visible.sync="setRoleDialogVisible"
         width="50%" @close="setRoleDialogClosed">
      <div>
        <p>当前的用户：{{userInfo.username}}</p>
        <p>当前的角色：{{userInfo.role_name}}</p>
        <p>分配新角色：
          <!--v-model="selectRoleId":选中的值；label:用户看到的值；value:传过去的值（将选中的id值给v-model）-->
          <el-select v-model="selectRoleId" placeholder="请选择">
            <el-option
                v-for="item in rolesList"
                :key="item.id"
                :label="item.roleName"
                :value="item.id">
            </el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
    <el-button @click="setRoleDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
  </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: "Users",
    data(){
      //自定义规则，验证邮箱的规则
      var checkEmail=(rule,value,cd)=>{
        //验证邮箱的正则表达式
        const regEmail=/^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
        //合法验证
        if(regEmail.test(value)){
          return cd()
        }
        cd(new Error('请输入合法邮箱'))
      }

      //自定义规则，验证手机号的规则
      var checkMobile=(rule,value,cd)=>{
        //验证手机号的正则表达式
        const regMobile=/^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
        if(regMobile.test(value)){
          return cd()
        }
        cd(new Error('请输入合法的手机号'))
      }
      return{
        //已选中的角色id值
        selectRoleId:'',
        //所有角色的用户列表
        rolesList:[],
        //需要被分配角色的用户信息
        userInfo:{},
        //控制分配角色对话框的显示与隐藏
        setRoleDialogVisible:false,
        //先把返回过来的值保存一下
        queryInfo:{
          query:'',
          //当前显示的页数
          pagenum:1,
          //当前每页显示几条数据
          pagesize:3
        },
        userList:[],
        total:0,
        //控制添加对话框的显示和隐藏
        addDialogVisible:false,
        //添加用户的表单验证
        addFrom:{
          userName:'',
          password:'',
          email:'',
          mobile:''

        },
        //添加表单的验证规则
        addFromRules:{
          userName:[
            { required: true, message: '请输入用户名', trigger: 'blur' },
            { min: 3, max:10, message: '长度在3 到 10 个字符', trigger: 'blur' }
          ],
          password:[
            { required: true, message: '请输入密码', trigger: 'blur' },
            { min:6, max:15, message: '长度在6到 15 个字符', trigger: 'blur' }
          ],
          email:[
            { required: true, message: '请输入邮箱', trigger: 'blur' },
            { validator: checkEmail, trigger: 'blur' }
          ],
          mobile:[
            { required: true, message: '请输入手机号', trigger: 'blur' },
            { validator: checkMobile, trigger: 'blur' }
          ],
        },
        //控制修改用户对话框的显示和隐藏
        editDialogVisible:false,
       //查询到的用户信息对象
        editForm:{},
        //修改表单的验证规则对象
        editFormRules:{
          email:[
            { required: true, message: '请输入用户邮箱', trigger: 'blur' },
            { validator: checkEmail, trigger: 'blur' }
          ],
          mobile:[
            { required: true, message: '请输入用户手机号', trigger: 'blur' },
            //  validator: checkMobile自定义验证规则的指定
            { validator: checkMobile, trigger: 'blur' }
          ],
        }
      }
    },
    created() {
     // 初始化的时候调用这个函数
     this.getUserList()
    },
    methods: {
      //得到用户列表对象
      async getUserList() {
        const {data: res} = await this.$http.get("users", {params: this.queryInfo})
        console.log(res);
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
        this.userList = res.data.users;
        this.total = res.data.total
      },
      //监听page-sizes改变的事件
      handleSizeChange(newsize) {
        this.queryInfo.pagesize = newsize;
        //每次改变后都要重新向后台请求数据；只需调用一下getUserList()这个函数就好
        this.getUserList()
      },
      //监听页码值的改变事件
      handleCurrentChange(newnum) {
        this.queryInfo.pagenum = newnum
        //每次改变后都要重新向后台请求数据
        this.getUserList()
      },
      //监听switch开关状态的改变
      async userStateChanged(userinfo) {
        console.log(userinfo);
        //调用接口，把状态同步到服务器中
        //向服务器发送请求，根据用户的id,修改用户的状态（也就是改变了后端的状态，在刷新的时候不会在改变）
        const {data: res} = await this.$http.put(`users/${userinfo.id}/state/${userinfo.mg_state}`)
        if (res.meta.status !== 200) {
          userinfo.mg_state = !userinfo.mg_state
          this.$message.error('更新用户失败');
        }
        this.$message.success('更新用户成功')
      },
      //监听添加用户对话框的关闭事件
      addDialogClosed() {
        //在对话框关闭的时候，重置表单
        this.$refs.addFromRef.resetFields()
      },
      //点击按钮添加用户
      addUser() {
        //表单预验证
        this.$refs.addFromRef.validate( async valid=>{
          //验证不通过，直接返回
          if(!valid) return
          //验证通过，可以发起添加用户的网络请求
          const {data:res}= await this.$http.post('users', this.addFrom)
          //如果请求错误，直接返回
          if(res.meta.status!==201) return this.$message.error('添加用户失败')
          //请求成功则添加
          this.$message.success('添加用户成功')
          //关闭当前对话框
          this.addDialogVisible=false
          //重新获取用户数据（因为加入了新用户，所以需要重新获取）
          this.getUserList()
        })
      },
      //展示编辑用户的对话框
      async showEditDialog(id){
        const {data:res}=await this.$http.get('users/' + id)
        if(res.meta.status!==200) return this.$message.error("查询用户信息失败")
        console.log(res);
        //将从接口查询到的信息，保存到data中
        this.editForm=res.data;
        this.editDialogVisible=true
      },
      //监听修改用户对话框的关闭事件
      editDialogClose(){
        this.$refs.editFormRef.resetFields()
      },
      //修改用户信息并提交；在提交之前需要对表单进行预验证
      editUserInfo(){
        this.$refs.editFormRef.validate(async valid=>{
         if(!valid) return
          //通过则发起修改用户信息的数据请求
          const {data:res} = await this.$http.put("users/"+this.editForm.id,{email:this.editForm.email,mobile:this.editForm.mobile})
          if(res.meta.status !== 200) return this.$message.error('更新用户信息失败')

          //刷新数据列表
          this.getUserList()
          //提示修改成功
          this.$message.success('更新用户信息成功')
          //关闭对话框
          this.editDialogVisible = false
        })
      },
      //根据id删除对应的用户信息
      async removeUserById(id){
        //先询问用户是否删除数据
          const confirmResult = await this.$confirm('此操作将永久删除该用户信息, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err=>err)
        //如果用户确认删除，则返回值为字符串confirm
        //如果用户取消删除，则返回值为字符串cancel
        // console.log(confirmResult);

        if(confirmResult!=='confirm') return this.$message.info('已取消删除');
        const {data:res}= await this.$http.delete('users/' + id)
        if(res.meta.status!==200) return this.$message.error('删除用户失败')
        // console.log(res);
        this.$message.success('删除用户成功')
        this.getUserList()
      },
      //展示分配角色的对话框
      async setRole(userInfo){
        this.userInfo=userInfo
        //在展示对话框之前，获取所有角色的列表
        const {data:res} = await this.$http.get('roles')
        if(res.meta.status!==200) return this.$message.error('获取用户列表失败')
        //将获取到的用户列表保存到data中
        this.rolesList=res.data
        // console.log(this.rolesList);
        this.setRoleDialogVisible=true
      },
      //点击按钮分配角色
      async saveRoleInfo(){
        if(!this.selectRoleId) return this.$message.error('请选择要分配的角色')
        const {data:res} = await this.$http.put(`users/${this.userInfo.id}/role`,{rid:this.selectRoleId})
        // console.log(res);
        if(res.meta.status!==200) return this.$message.error('更新角色失败')
        this.$message.success('更新角色成功')
        this.getUserList()
        this.setRoleDialogVisible=false
      },
      // 监听分配角色对话框的关闭事件
      setRoleDialogClosed(){
        this.selectRoleId=''
        this.userInfo={}

      }
    }
  }
</script>

<style scoped>

</style>