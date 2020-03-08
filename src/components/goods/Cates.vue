<template>
  <div>
    <!-- eslint-disable -->
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog"
            >添加分类</el-button
          >
        </el-col>
      </el-row>
      <tree-table
        :data="catelist"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="#"
        border
        :show-row-hover="false"
        class="treeTable"
      >
        <template v-slot:isok="scope">
          <i
            class="el-icon-success"
            v-if="!scope.row.cat_deleted"
            style="color:lightgreen;"
          ></i>
          <i class="el-icon-error" v-else style="color:red;"></i>
        </template>

        <template v-slot:order="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag
            size="mini"
            type="success"
            v-else-if="scope.row.cat_level === 1"
            >二级</el-tag
          >
          <el-tag size="mini" type="warning" v-else>三级</el-tag>
        </template>
        <template v-slot:opt="scope">
          <el-button
            size="mini"
            type="primary"
            icon="el-icon-edit"
            @click="showEditCateDialog(scope.row.cat_id)"
            >编辑</el-button
          >
          <el-button
            size="mini"
            type="danger"
            icon="el-icon-delete"
            @click="delCateById(scope.row.cat_id)"
            >删除</el-button
          >
        </template>
      </tree-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="querInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="querInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>

    <!-- 添加分类 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
      @close="addCateDialogClosed"
    >
      <!-- 内容主体区域 -->
      <el-form
        :model="addCateForm"
        :rules="addCateFormRules"
        ref="addCateFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类：">
          <el-cascader
            v-model="selectedKeys"
            :options="parentCateList"
            :props="{
              expandTrigger: 'hover',
              value: 'cat_id',
              label: 'cat_name',
              children: 'children',
              checkStrictly: true
            }"
            @change="parentCateChanged(selectedKeys, addCateForm)"
            clearable
          ></el-cascader>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改分类 -->
    <el-dialog
      title="修改分类"
      :visible.sync="editCateFormDialogVisible"
      width="50%"
    >
      <!-- 内容主体区域 -->
      <el-form
        :model="editCateForm"
        :rules="editCateFormRules"
        ref="editCateFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
        <!-- <el-form-item label="父级分类：">
          <el-cascader
            v-model="selectedEditKeys"
            :options="parentCateEditList"
            :props="{
              expandTrigger: 'hover',
              value: 'cat_id',
              label: 'cat_name',
              children: 'children',
              checkStrictly: true
            }"
            :show-levels="false"
            @change="parentCateChanged(selectedEditKeys, editCateForm)"
            clearable
          ></el-cascader>
        </el-form-item> -->
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateFormDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCateInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 查询条件
      querInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 商品分类的数据列表，默认为空
      catelist: [],
      // 总数据条数
      total: 0,
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          type: 'template',
          template: 'isok'
        },
        {
          label: '排序',
          type: 'template',
          template: 'order'
        },
        {
          label: '操作',
          type: 'template',
          template: 'opt'
        }
      ],
      addCateDialogVisible: false,
      addCateForm: {
        cat_name: '',
        cat_pid: 0,
        cat_level: 0
      },
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      parentCateList: [],
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      selectedKeys: [],
      delCateDialogVisible: false,
      editCateForm: {
        cat_name: '',
        cat_pid: 0,
        cat_level: 0
      },
      editCateFormDialogVisible: false,
      editCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      selectedEditKeys: [],
      parentCateEditList: []
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 获取商品分类数据
    async getCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: this.querInfo
      })

      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败！')
      }

      // console.log(res.data)
      // 把数据列表，赋值给 catelist
      this.catelist = res.data.result
      // 为总数据条数赋值
      this.total = res.data.total
    },
    handleSizeChange(newSize) {
      this.querInfo.pagesize = newSize
      this.getCateList()
    },
    handleCurrentChange(newPage) {
      this.querInfo.pagenum = newPage
      this.getCateList()
    },
    showAddCateDialog() {
      this.getParentCateList()
      this.addCateDialogVisible = true
    },
    async getParentCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: { type: 2 }
      })

      if (res.meta.status !== 200) {
        this.$message.error('获取父级分类数据失败！')
      }
      this.parentCateList = res.data
    },
    parentCateChanged(key, form) {
      if (key.length > 0) {
        form.cat_pid = key[key.length - 1]
        form.cat_level = key.length
      } else {
        form.cat_pid = 0
        form.cat_level = 0
      }
      console.log(key, form)
    },
    // parentCateChanged() {
    //   if (this.selectedKeys.length > 0) {
    //     this.addCateForm.cat_pid = this.selectedKeys[
    //       this.selectedKeys.length - 1
    //     ]
    //     this.addCateForm.cat_level = this.selectedKeys.length
    //   } else {
    //     this.addCateForm.cat_pid = 0
    //     this.addCateForm.cat_level = 0
    //   }
    // },
    // parentCateEditChanged() {
    //   if (this.selectedEditKeys.length > 0) {
    //     this.editCateForm.cat_pid = this.selectedEditKeys[
    //       this.selectedEditKeys.length - 1
    //     ]
    //     this.editCateForm.cat_level = this.selectedEditKeys.length
    //   } else {
    //     this.editCateForm.cat_pid = 0
    //     this.editCateForm.cat_level = 0
    //   }
    // },
    addCate() {
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return 0
        const { data: res } = await this.$http.post(
          'categories',
          this.addCateForm
        )
        if (res.meta.status !== 201) {
          this.$message.error('添加分类错误!')
        }
        this.$message.success('添加分类成功!')
        this.addRoleVisible = false

        this.getCateList()
        this.addCateDialogVisible = false
      })
    },
    addCateDialogClosed() {
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_level = 0
      this.addCateForm.cat_pid = 0
    },
    delCateDialogClosed() {
      this.delCateDialogVisible = false
    },
    async delCateById(id) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该用户, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)

      // 如果用户确认删除，则返回值为字符串 confirm
      // 如果用户取消了删除，则返回值为字符串 cancel
      // console.log(confirmResult)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }

      const { data: res } = await this.$http.delete('categories/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除分类失败！')
      }

      this.$message.success('删除分类成功！')
      this.getCateList()
    },
    async showEditCateDialog(id) {
      const { data: res } = await this.$http.get('categories/' + id)
      console.log(res)
      this.editCateForm = res.data
      this.editCateFormDialogVisible = true
    },
    editCateInfo() {
      this.$refs.editCateFormRef.validate(async valid => {
        console.log(valid)
        if (!valid) return
        console.log(this.editCateForm)
        const { data: res } = await this.$http.put(
          'categories/' + this.editCateForm.cat_id,
          {
            cat_name: this.editCateForm.cat_name
          }
        )

        if (res.meta.status !== 200) {
          return this.$message.error('更新分类失败！')
        }

        // 关闭对话框
        this.editCateFormDialogVisible = false
        // 刷新数据列表
        this.getCateList()
        // 提示修改成功
        this.$message.success('更新分类成功！')
      })
    }
  }
}
</script>

<style lang="less" scoped>
.treeTable {
  margin-top: 15px;
}
.el-cascader {
  width: 100%;
}
</style>
