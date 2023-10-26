<template>
  <div class="header">
    <!-- 折叠按钮 -->
    <div class="collapse-btn" @click="collapseChage">
      <el-icon v-if="sidebar.collapse">
        <Expand/>
      </el-icon>
      <el-icon v-else>
        <Fold/>
      </el-icon>
    </div>
    <div class="logo">后台管理系统</div>
    <div class="header-right">
      <div class="header-user-con">
        <!-- 切换应用按钮 -->
        <el-button @click="changeApp" type="primary" class="header-button" icon="Switch">{{ changeAppDes }}</el-button>
        <!-- 退出登录按钮 -->
        <el-button @click="logout" type="danger" class="header-button" icon="SwitchButton">退出登录</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref} from 'vue';
import {useSidebarStore} from '../store/SideBar';
import CommonUtil from '../utils/CommonUtil';
import {ElMessageBox} from 'element-plus';
import {Expand, Fold} from '@element-plus/icons-vue';
import {useRouter} from 'vue-router';
import LocalStorageUtil from "../utils/LocalStorageUtil";
import Constant from "../constant/Constant";
import {useTagsStore} from "../store/Tags";

let router = useRouter();

const changeAppDes = ref('');

const sidebar = useSidebarStore();

const collapseChage = () => {
  sidebar.handleCollapse();
};

onMounted(() => {
  if (document.body.clientWidth < 1500) {
    collapseChage();
  }
  changeAppDes.value = LocalStorageUtil.getItem<string>(Constant.CURRENT_APP_NAME_KEY, '');
});

const changeApp = () => {
  useTagsStore().clearTags();
  router.push('/apps');
};

const logout = () => {
  ElMessageBox.confirm('您确定要退出登录吗？', '', {type: 'info'}).then(async () => {
    CommonUtil.logout();
  }).catch(() => {
  });
};
</script>

<style scoped>
.header {
  position: relative;
  box-sizing: border-box;
  width: 100%;
  height: 70px;
  font-size: 22px;
  color: #fff;
}

.collapse-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  float: left;
  padding: 0 20px;
  cursor: pointer;
}

.header .logo {
  float: left;
  width: 250px;
  line-height: 70px;
}

.header-right {
  float: right;
  margin-right: 20px;
}

.header-user-con {
  display: flex;
  height: 70px;
  align-items: center;
}

.header-button {
  color: #fff;
  cursor: pointer;
  margin-left: 10px;
}
</style>
