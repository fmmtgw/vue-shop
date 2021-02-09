<template>
  <div>
    <!--面包屑部分-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片视图区域-->
    <el-card>
      <!--添加角色按钮区域-->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addDialogVisible=true">添加用户</el-button>
        </el-col>
      </el-row>
      <!--角色列表区域-->
      <el-table :data="rolesList" border  stripe>
        <!--展开列;设置属性为type="expand"-->
        <el-table-column type="expand">
          <!--用作用域插槽的方式得到当前行的数据-->
          <template slot-scope="scope">
            <!--使用栅格系统来划分权限列-->
            <!--循环的第一个children为一级权限-->
            <el-row :class="['bdbottom',i1===0?'bdtop':'','vcenter']" v-for="(item1,i1) in scope.row.children" :key="item1.id">
              <!--渲染一级权限-->
              <el-col :span="5">
                <!--将一级权限渲染出来-->
                <el-tag closable @close="removeRightById(scope.row,item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!--渲染二级和三级权限-->
              <el-col :span="19">
                <!--通过for循环，嵌套渲染二级权限-->
                <el-row :class="[i2===0?'':'bdtop','vcenter']" v-for="(item2,i2) in item1.children" :key="item2.id">
                  <el-col :span="6">
                    <el-tag type="success" closable @close="removeRightById(scope.row,item2.id)">{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <!--closable添加可删除的标签属性-->
                    <el-tag type="warning" v-for="(item3,i3) in item2.children" :key="item3.id" closable @close="removeRightById(scope.row,item3.id)">{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
            <!--有层次的显示获取到的数据-->
           <!-- <pre>
              {{scope.row}}
            </pre>-->
          </template>
        </el-table-column>
        <el-table-column type="index" label="索引"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeRoule(scope.row.id)">删除</el-button>
            <el-button type="warning" icon="el-icon-setting" size="mini" @click="showSetRightDialog(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!--添加用户对话框-->
    <el-dialog
        title="添加用户"
        :visible.sync="addDialogVisible"
        width="30%" @close="addDialogClose">
      <el-form ref="addFormRef" :model="addRoule" :rules="addRouleRules" label-width="100px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRoule.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRoule.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="addDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addRoules">确 定</el-button>
  </span>
    </el-dialog>
    <!--修改用户的对话框-->
    <el-dialog
        title="修改用户"
        :visible.sync="editDialogVisible"
        width="50%"
        @close="editDialogClose"
        >
      <el-form ref="editFormRef" :model="editRoule" :rules="editRouleRules" label-width="100px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editRoule.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editRoule.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="editDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="editRoules">确 定</el-button>
  </span>
    </el-dialog>
    <!--分配权限的对话框-->
    <el-dialog
        title="分配权限"
        :visible.sync="setRightDialogVisible"
        width="50%" @close="setRightDialogClosed">
      <!--树形控件-->
      <el-tree :data="rightsList" :props="treeProps"
               show-checkbox node-key="id"
               default-expand-all :default-checked-keys="defKeys"
               ref="treeRef"></el-tree>
      <span slot="footer" class="dialog-footer">
    <el-button @click="setRightDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="allotRights">确 定</el-button>
  </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: "Roles",
    data(){
      return{
        //控制分配权限对话框的展示与隐藏
        setRightDialogVisible:false,
        //所有权限的数据
        rightsList:[],
        //树形控件的属性绑定对象
        treeProps:{
          //指定看到的是那个属性
          label:'authName',
          //父子节点通过哪个属性嵌套的
          children:'children'
        },
        //默认选中的节点id数组
        defKeys:[],
        //所有角色列表数据
        rolesList:[],
        //保存当前即将分配权限的id
        roleId:'',
        //添加用户的表单数据
        addRoule:{
          roleName:'',
          roleDesc:''
        },
        //查询到的角色对象
        editRoule:{
        },
        //修改表单的验证规则
        editRouleRules:{
          roleName:[
            { required:true, message: '请输入角色名称', trigger: 'blur' },
            { min:3, max:5,message:'角色名称在3-5个字符之间', trigger: 'blur' },
          ],
          roleDesc:[
            { required: true, message: '请输入角色的描述', trigger: 'blur' },
            { min:3, max:10,message:'角色名称在3-10个字符之间', trigger: 'blur' },
          ]
        },
        //控制修改用户对话框的显示和隐藏
        editDialogVisible:false,

        //控制添加用户对话框的显示和隐藏
        addDialogVisible:false,
        //添加表单验证规则
        addRouleRules:{
          roleName:[
            { required:true, message: '请输入角色名称', trigger: 'blur' },
            { min:3, max:5,message:'角色名称在3-5个字符之间', trigger: 'blur' },
          ],
          roleDesc:[
            { required: true, message: '请输入角色的描述', trigger: 'blur' },
            { min:3, max:10,message:'角色名称在3-10个字符之间', trigger: 'blur' },
          ]
        }
      }
    },
    created() {
      this.getRolesList()
    },
    methods: {
      //获取所有角色的列表
      async getRolesList() {
        const {data: res} = await this.$http.get('roles')
        // console.log(res);
        if (res.meta.status !== 200) return this.$message.error('获取角色列表失败')
        this.rolesList = res.data
      },
      //监听添加用户对话框的关闭事件;当对话框关闭的时候，对表单进行重置
      addDialogClose() {
        this.$refs.addFormRef.resetFields()
      },
      //点击确认按钮，添加角色名称
      addRoules() {
        //在添加之前先对表单进行预验证
       this.$refs.addFormRef.validate(async valid => {
          // console.log(valid);
          if(!valid) return
         //验证通过发起axios请求
         const {data:res} = await this.$http.post('roles',this.addRoule)
         if(res.meta.status!==201) return this.$message.error("添加角色名称失败")
         this.$message.success("添加角色名称成功")
         this.addDialogVisible=false
         this.getRolesList()
        })
      },
      //点击编辑显示当前用户的对话框
      async showEditDialog(id){
        this.editDialogVisible=true
        //根据id,得到当前的用户信息
        // console.log(id)
         const {data:res} = await this.$http.get('roles/' + id)
        // console.log(id);
        if(res.meta.status!==200) return this.$message.error("查询角色名称失败")
        // this.$message.success("查询角色名称成功")
        this.editRoule=res.data
      },
      //监听修改对话框的关闭事件；点击取消时关闭对话框并重置表单
      editDialogClose(){
        this.$refs.editFormRef.resetFields()
      },
      //点击确认按钮，对表单进行预验证并发起修改请求
      editRoules(){
      //  先对表单进行预验证
        this.$refs.editFormRef.validate(async valid => {
          if(!valid) return
          //验证通过发起axios请求
          const {data:res} = await this.$http.put('roles/' + this.editRoule.roleId,{
            roleName:this.editRoule.roleName,
            roleDesc:this.editRoule.roleDesc
          })
          console.log(res);
          if(res.meta.status!==200) return this.$message.error("编辑角色信息失败")
          this.editDialogVisible=false
          this.getRolesList()
          this.$message.success("编辑角色信息成功")
        })
      },
      //根据id删除角色
      async removeRoule(id){
         //先询问用户是否删除
        const confirmRelust= await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err=>err) //捕获错误消息
        //如果用户确认删除，则返回值为字符串confirm
        //如果用户点击取消，则返回值为字符串cancel
        // console.log(confirmRelust);
        if(confirmRelust!=='confirm') return this.$message.error("已取消删除")
        const {data:res} = await this.$http.delete("roles/"+id)
        if(res.meta.status!==200) return this.$message.error("删除角色名称失败")
        this.$message.success("删除角色信息成功")
        this.getRolesList()
      },
      //根据id删除用户的权限（需要用角色的id和权限的id）
      async removeRightById(role,rightId){
        const confirmRules= await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err=>err);
        if(confirmRules!=='confirm') return this.$message.error("已取消删除");
        const {data:res} = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
        if(res.meta.status!==200) return this.$message.error("删除权限失败")
        // this.$message.success("删除权限成功")
        //返回的data, 是当前角色下最新的权限数据
        //如果直接调用函数，会重新加载表格页面，这样不利于用户查看，所以所以只需要更新权限就可以了
        role.children=res.data
      },
      //展示分配权限的对话框
      async showSetRightDialog(role){
        //得到对应权限的id,并保存到data中
        this.roleId=role.id
        //在展示对话框之前，获取所有权限列表的数据
        const {data:res} = await this.$http.get('rights/tree')
        if(res.meta.status!==200) return this.$message.error("获取权限数据失败")
        //把获取到的权限数据保存到data中
        this.rightsList=res.data
        // console.log(this.rightsList);
        //递归获取三级节点的id
        this.getLeafKeys(role,this.defKeys)
        this.setRightDialogVisible=true
      },
      //通过递归的形式，获取角色下的所有三级权限的id,并保存到 defKeys数组中
      getLeafKeys(node,arr){
        //如果当前节点不包含children属性，则是三级节点
        if(!node.children){
          return arr.push(node.id)
        }
        node.children.forEach(item=>{
          this.getLeafKeys(item,arr)
        })
      },
      //监听分配权限对话框的关闭事件
      setRightDialogClosed(){
        //当关闭对话框时，清空数组
        this.defKeys=[]
      },
      async allotRights(){
      //  点击确定按钮为角色分配权限
      //  获取选中和半选中的角色权限的id将他放入keys这个数组中
        const keys=[
            ...this.$refs.treeRef.getCheckedKeys(),
            ...this.$refs.treeRef.getHalfCheckedKeys()
        ]
        const idStr=keys.join(',')
        const {data:res} =await this.$http.post(`roles/${this.roleId}/rights`,{rids:idStr})
        if(res.meta.status!==200) return this.$message.error('分配权限失败')
        this.$message.success('分配权限成功')
        this.getRolesList()
        this.setRightDialogVisible=false
      }
    }
  }
</script>

<style scoped>
.el-tag{
  margin: 7px;
}
  .bdtop{
    border-top:1px solid #eee;
  }
  .bdbottom{
    border-bottom:1px solid #eee;
  }
  /*添加类名，使权限竖直居中*/
  .vcenter{
    display: flex;
    align-items: center;
  }
</style>