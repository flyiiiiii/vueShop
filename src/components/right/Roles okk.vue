<template>
  <!-- eslint-disable -->
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="addRoleVisible = true"
            >添加角色</el-button
          >
        </el-col>
      </el-row>
    </el-card>
    <el-card>
      <el-table :data="rolelist" border stripe>
        <!-- 展开列 -->
        <el-table-column label="" type="expand">
          <template v-slot="scope">
            <el-row
              :class="['bdbottom vcenter', i1 === 0 ? 'bdtop' : '']"
              v-for="(item1, i1) in scope.row.children"
              :key="item1.id"
            >
              <el-col :span="5">
                <el-tag>{{ item1.authName }}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <el-col :span="19">
                <el-row
                  :class="['vcenter', i2 === 0 ? '' : 'bdtop']"
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag type="success">{{ item2.authName }}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      closable
                      @close="removeRightById(scope.row, item3.id)"
                      >{{ item3.authName }}</el-tag
                    >
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
            <pre></pre>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300">
          <template v-slot="scope">
            <el-button
              type="primary"
              icon="el-icon-search"
              size="mini"
              @click="showEditRoleDialog(scope.row.id)"
              >编辑</el-button
            >
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeRoleById(scope.row.id)"
              >删除</el-button
            >
            <el-button type="warning" icon="el-icon-setting" size="mini"
              >分配权限</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加用户的对话框 
    -->
    <el-dialog
      title="添加角色"
      :visible.sync="addRoleVisible"
      width="50%"
      @close="addRoleClosed"
    >
      <!-- 内容主体区域 -->
      <el-form
        :model="addRole"
        :rules="addRoleRules"
        ref="addRoleRef"
        label-width="70px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRole.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRole.roleDesc"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="addRoleVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRoleFunc">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改角色的对话框 -->

    <el-dialog
      title="修改角色"
      :visible.sync="editRoleVisible"
      width="50%"
      @close="editRoleClosed"
    >
      <!-- 内容主体区域 -->
      <el-form
        :model="editRole"
        :rules="editRoleRules"
        ref="editRoleRef"
        label-width="70px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editRole.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editRole.roleDesc"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="editRoleVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 角色数据
      rolelist: [],
      addRoleVisible: false,
      addRole: {
        roleName: '',
        roleDesc: ''
      },
      addRoleRules: {},
      editRole: {
        roleId: '',
        roleName: '',
        roleDesc: ''
      },
      editRoleVisible: false,
      editRoleRules: {}
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败！')
      }
      this.rolelist = res.data
      // console.log(this.rolelist)
    },
    addRoleFunc() {
      console.log(this.$refs.addRoleRef)
      this.$refs.addRoleRef.validate(async valid => {
        console.log(valid)
        if (!valid) return 0
        // 发起添加用户的网络请求
        const { data: res } = await this.$http.post('roles', this.addRole)
        console.log(res)
        if (res.meta.status !== 201) {
          this.$message.error('添加错误')
        }
        this.$message.success('添加成功')
        this.addRoleVisible = false
        this.getRolesList()
      })
    },
    addRoleClosed() {
      this.$refs.addRoleRef.resetFields()
    },
    async showEditRoleDialog(id) {
      const { data: res } = await this.$http.get('roles/' + id)
      this.editRole = res.data

      this.editRoleVisible = true
    },
    editRoleClosed() {
      this.$refs.editRoleRef.resetFields()
    },
    editRoleInfo() {
      this.$refs.editRoleRef.validate(async valid => {
        // console.log(valid)
        if (!valid) return
        // console.log(this.editRole)
        const { data: res } = await this.$http.put(
          'roles/' + this.editRole.roleId,
          {
            roleName: this.editRole.roleName,
            roleDesc: this.editRole.roleDesc
          }
        )

        if (res.meta.status !== 200) {
          return this.$message.error('更新角色信息失败！')
        }

        // 关闭对话框
        this.editRoleVisible = false
        // 刷新数据列表
        this.getRolesList()
        // 提示修改成功
        this.$message.success('更新角色信息成功！')
      })
    },
    removeRoleById(id) {
      this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
          const { data: res } = await this.$http.delete('roles/' + id)
          if (res.meta.status !== 200) {
            return this.$message.error('删除角色信息失败！')
          }

          this.$message.success('删除角色信息成功！')
          this.getRolesList()
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },
    // 根据Id删除对应的权限
    async removeRightById(role, rightId) {
      // 弹框提示用户是否要删除
      const confirmResult = await this.$confirm(
        '此操作将永久删除该文件, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)

      if (confirmResult !== 'confirm') {
        return this.$message.info('取消了删除！')
      }

      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      )

      if (res.meta.status !== 200) {
        return this.$message.error('删除权限失败！')
      }

      // this.getRolesList()
      role.children = res.data
    }
  }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}

.bdbottom {
  border-bottom: 1px solid #eee;
}

.vcenter {
  display: flex;
  align-items: center;
}
</style>
