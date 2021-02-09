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
      <!--:data="rightsList";指定数据源-->
      <el-table :data="rightsList" border  stripe>
        <!--type="index"；索引列-->
        <el-table-column type="index"></el-table-column>
        <!--label="权限名称"；表格标题；prop="authName"；rightsList下面的属性名-->
        <el-table-column label="权限名称" prop="authName"></el-table-column>
        <el-table-column label="路径" prop="path"></el-table-column>
        <el-table-column label="权限等级" prop="level">
          <!--需要美化权限；所以要使用自定义插槽模板-->
          <template slot-scope="scope">
            <!--使用v-if判断要显示的权限-->
            <el-tag v-if="scope.row.level==='0'">一级</el-tag>
            <el-tag type="success" v-else-if="scope.row.level==='1'">二级</el-tag>
            <el-tag type="warning" v-else>三级</el-tag>
          </template>
        </el-table-column>

      </el-table>
    </el-card>
  </div>
</template>

<script>
  export default {
    name: "Rights",
    data(){
      return{
        //权限列表(从服务器获取到的数据，保存到data中)
        rightsList:[]
      }
    },
    created() {
      this.getRightsList()
    },
    methods:{
      //获取权限列表
      async getRightsList(){
        const {data:res} = await this.$http.get('rights/list')
        // console.log(res);
        if(res.meta.status!==200) return this.$message.error('获取数据失败')
        this.rightsList=res.data
      }
    }
  }
</script>

<style scoped>

</style>