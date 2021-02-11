<template>
 <div>
   <!--面包屑导航区域-->
   <el-breadcrumb separator-class="el-icon-arrow-right">
     <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
     <el-breadcrumb-item>商品管理</el-breadcrumb-item>
     <el-breadcrumb-item>商品分类</el-breadcrumb-item>
   </el-breadcrumb>
   <!--卡片视图-->
   <el-card class="box-card">
     <el-row>
       <el-col>
         <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
       </el-col>
     </el-row>
     <!--表格区域-->
     <!--:data="cateList"；表格的数据源;:selection-type="false" 是否为多选框表格；:expand-type="false"：是否为展开行的表格-->
     <!-- index-text="#"；添加索引标题 show-index：自定义添加索引;show-row-hover:鼠标悬浮时是否高亮当前行-->
     <tree-table class="treeTop" :selection-type="false" :show-row-hover="false" :expand-type="false" border index-text="#" show-index :data="cateList" :columns="columns">
       <!--使用模板字符串添加列-->
       <!--是否有效-->
       <template slot="isok" slot-scope="scope">
         <i class="el-icon-circle-check" v-if="scope.row.cat_deleted===false" style="color:lightgreen"></i>
         <i class="el-icon-circle-cross" v-else style="color:red"></i>
       </template>
       <!--排序列-->
       <template slot="order" slot-scope="scope">
         <el-tag size="mini" v-if="scope.row.cat_level===0">一级</el-tag>
         <el-tag size="mini" type="success" v-else-if="scope.row.cat_level===1">二级</el-tag>
         <el-tag size="mini" type="warning" v-else="scope.row.cat_level===2">三级</el-tag>
       </template>
       <!--操作-->
       <template slot="opt" slot-scope="scope">
         <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
         <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
       </template>
     </tree-table>

     <!--分页区域-->
     <!--@size-change:监听每页显示条数的变化；@current-change:监听当前的页码值；current-page：动态的绑定到当前的页码值；total：获取的总条数-->
     <el-pagination
         @size-change="handleSizeChange"
         @current-change="handleCurrentChange"
         :current-page="queryInfo.pagenum"
         :page-sizes="[3, 5, 10, 15]"
         :page-size="queryInfo.pagesize"
         layout="total, sizes, prev, pager, next, jumper"
         :total="total">
     </el-pagination>
   </el-card>
   <!--添加父级对话框-->
   <el-dialog
       title="添加分类"
       :visible.sync="addCateDialogVisible"
       width="50%" @close="addCateDialogClose">
     <!--添加分类的表单-->
     <el-form :model="addCateFrom" :rules="addCateFromRules" ref="addCateFromRef" label-width="100px">
       <el-form-item label="分类名称：" prop="cat_name">
         <el-input v-model="addCateFrom.cat_name"></el-input>
       </el-form-item>
       <el-form-item label="父级分类：">
         <!-- :options:当前级联选择器的数据源-->
         <!--:props:用来指定配置对象-->
         <el-cascader
             expand-trigger="hover"
             :options="parentCateList"
             :props="cascaderProps"
             v-model="selectedKeys"
             @change="parentCateChenge"
             clearable change-on-select>
         </el-cascader>
       </el-form-item>
     </el-form>
     <span slot="footer" class="dialog-footer">
    <el-button @click="addCateDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addCate">确 定</el-button>
  </span>
   </el-dialog>
 </div>
</template>

<script>
  export default {
    name: "Cate",
    data(){
      return{
        //父级分类的列表
        parentCateList:[],
        //指定级联选择器的配置对象
        cascaderProps:{
          //具体选中的属性
          value:'cat_id',
          //所看到的属性
          label:'cat_name',
          //父子嵌套所用的属性
          children:'children'
        },
        //选中的父级分类的id数组
        selectedKeys:[],
        //控制添加按钮对话框的显示和隐藏
        addCateDialogVisible:false,
        //添加分类的表单数据对象
        addCateFrom:{
          //将要添加的分类的名称
          cat_name:'',
          //父级分类的Id
          cat_pid:0,
          //分类的等级默认添加的是一级分类
          cat_level:0
        },
        //添加分类表单的验证规则对象
        addCateFromRules:{
          cat_name:[
            { required: true, message: '请输入分类名称', trigger: 'blur' },
            { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' }
          ],
        },
        //商品分类的数据列表,默认为空
        cateList:[],
        //总数据条数
        total:0,
        //为table指定列的定义
        columns:[
          {
            //指定当前列的标题
            label:'分类名称',
            //当前列所绑定的数据
            prop:'cat_name'
          },
          {
            label: "是否有效",
            // 表示将当前列定义为模板列
            type:'template',
            //表示当前列使用的模板名称
            template:'isok'
          },
          {
            label: "排序",
            // 表示将当前列定义为模板列
            type:'template',
            //表示当前列使用的模板名称
            template:'order'
          },
          {
            label: "操作",
            // 表示将当前列定义为模板列
            type:'template',
            //表示当前列使用的模板名称
            template:'opt'
          }
        ],
        //这是查询条件
        queryInfo:{
          type:3,
          pagenum:1,
          pagesize:5
        },
      }
    },
    created() {
      this.getCateList()
    },
    methods:{
      //获取商品分类的数据
      async getCateList(){
        const {data:res} = await this.$http.get('categories',{params:this.queryInfo})
        if(res.meta.status!==200) return this.$message.error('获取商品分类失败')
        //把数据列表赋值到data中的cateList
        this.cateList=res.data.result
        //为总数据条数赋值
        this.total=res.data.total
      },
      //监听pagesize（每页的条数）改变的事件；得到最新的pagesize
      handleSizeChange(newSize){
        this.queryInfo.pagesize=newSize
        this.getCateList()
      },
    //监听pagenum(页码值)的改变
      handleCurrentChange(newPage){
        this.queryInfo.pagenum=newPage
        this.getCateList()
      },
      //点击添加按钮显示对话框
      showAddCateDialog(){
        //先获取父级数据分类的数据列表
        this.getAddCateDialog()
        //再展示出对话框
        this.addCateDialogVisible=true

      },
      //获取父级分类的数据列表
      async getAddCateDialog(){
        const {data:res} = await this.$http.get('categories',{params:{type: 2 }})
        if(res.meta.status!==200) return this.$message.error("获取父级数据失败")
        // console.log(res.data);
        this.parentCateList=res.data
      },
      //选择项发生改变触发这个函数
      parentCateChenge(){
        console.log(this.selectedKeys);
        //如果selectedKeys数组的长度大于0 证明选中的父级分类
        //反之，就说明没有选中任何父级分类
        if(this.selectedKeys.length>0){
          //分级分类的id
          this.addCateFrom.cat_pid=this.selectedKeys[this.selectedKeys.length-1]
          //为当前分类的等级赋值
          this.addCateFrom.cat_level=this.selectedKeys.length
          return
        }else {
          //分级分类的id
          this.addCateFrom.cat_pid=0
          //为当前分类的等级赋值
          this.addCateFrom.cat_level=0
        }
      },
      //点击按钮添加新的分类
      addCate(){
       this.$refs.addCateFromRef.validate(async valid=>{
         if(!valid) return
         const {data:res} = await this.$http.post('categories',this.addCateFrom)
         if(res.meta.status!==201) return this.$message.error('添加分类失败')
         this.$message.success('添加分类成功')
         this.getCateList()
         this.addCateDialogVisible=false
       })
      },
      //监听对话框的关闭事件，重置表单数据
      addCateDialogClose(){
        this.$refs.addCateFromRef.resetFields()
        this.selectedKeys=[]
        this.addCateFrom.cat_pid=0
        this.addCateFrom.cat_level=0
      }
    }
  }
</script>

<style scoped>
.treeTop{
  margin: 15px 0;

}
.el-cascader{
  width: 100%;
}
</style>