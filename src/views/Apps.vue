<template>
  <div class="container">
    <!-- Main -->
    <el-main class="main">
      <!-- "全部应用" 标签 -->
      <div class="app-label">全部应用</div>
      <!-- 创建应用和列表块 -->
      <div class="app-list">
        <!-- 创建应用和退出登录 -->
        <div class="button-container">
          <!-- 创建应用按钮（左侧） -->
          <div>
            <el-button type="primary" @click="handleCreateApp">创建应用</el-button>
          </div>
          <!-- 退出登录按钮（右侧） -->
          <div>
            <el-button link @click="handleLogout">退出登录</el-button>
          </div>
        </div>
        <!-- 列表 -->
        <el-table :data="pagedData" border class="table" header-cell-class-name="table-header">
          <el-table-column prop="app_name" label="应用名称"></el-table-column>
          <el-table-column prop="create_time" label="创建时间" :formatter="dateFormat"></el-table-column>
          <el-table-column prop="app_id" label="应用ID"></el-table-column>
          <el-table-column label="操作">
            <template #default="{ row }">
              <el-button type="primary" size="small" @click="chooseApp(row)">查看</el-button>
              <el-button type="danger" size="small" @click="deleteApp(row)" class="delete-button">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <!-- 分页控件 -->
        <div class="pagination">
          <el-pagination
              background
              layout="total , prev, pager, next"
              :total="totalItems"
              :current-page.sync="currentPage"
              :page-size="pageSize"
              @current-change="handlePageChange">
          </el-pagination>
        </div>
      </div>
    </el-main>

    <el-dialog title="创建应用" v-model="inputAppNameDialogVisible" width="30%">
      <el-form label-width="70px">
        <el-form-item label="应用名称">
          <el-input v-model="inputAppNameForm.name" placeholder="请输入要创建的应用名称"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="inputAppNameDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="createApp">确 定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import {onMounted, reactive, ref} from 'vue';
import CommonUtil from "../utils/CommonUtil";
import {ElMessageBox} from "element-plus";
import {AppListModel, AppModel, BaseModel, CreateApp, CreateAppModel, DeleteApp, GetAppList} from "../api/Api";
import LocalStorageUtil from "../utils/LocalStorageUtil";
import Constant from "../constant/Constant";
import router from "../router/Router";

const pagedData = ref<AppModel[]>([]);
const totalItems = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);

const dateFormat = (row: AppModel) => {
  return CommonUtil.dateFormat(row.create_time);
};

const fetchAppData = async () => {
  CommonUtil.processResult<AppListModel>(await GetAppList(currentPage.value), (listModel) => {
    pagedData.value = listModel.data;
    if (totalItems.value === 0) {
      totalItems.value = listModel.count;
    }
  });
};

const deleteApp = async (app: AppModel) => {
  ElMessageBox.confirm('您确定要删除该应用吗？', '', {type: 'warning'}).then(async () => {
    const indexToDelete = pagedData.value.findIndex(item => item.app_id === app.app_id);
    CommonUtil.processResult<BaseModel>(await DeleteApp(app.app_id), (result) => {
      pagedData.value.splice(indexToDelete, 1);
    });
  }).catch(() => {
  });
};

const handlePageChange = (page: number) => {
  currentPage.value = page;
  fetchAppData();
};

const inputAppNameDialogVisible = ref(false);

let inputAppNameForm = reactive({
  name: '',
});

const handleCreateApp = () => {
  inputAppNameDialogVisible.value = true;
}

const createApp = async () => {
  inputAppNameDialogVisible.value = false;

  if (inputAppNameForm.name.length > 0) {
    CommonUtil.processResult<CreateAppModel>(await CreateApp(inputAppNameForm.name), (result) => {
      pagedData.value.push({
        app_name: inputAppNameForm.name,
        create_time: Date.now() / 1000,
        app_id: result.app_id
      });
      inputAppNameForm.name = '';
    });
  }
};

const chooseApp = (row: AppModel) => {
  LocalStorageUtil.setItem<string>(Constant.CURRENT_APP_ID_KEY, row.app_id);
  LocalStorageUtil.setItem<string>(Constant.CURRENT_APP_NAME_KEY, row.app_name);
  router.push('/deviceList');
};

const handleLogout = () => {
  ElMessageBox.confirm('您确定要退出登录吗？', '', {type: 'info'}).then(async () => {
    CommonUtil.logout()
  }).catch(() => {
  });
};

onMounted(() => {
  fetchAppData();
  //清除本地记录的应用ID和名称
  LocalStorageUtil.removeItem(Constant.CURRENT_APP_ID_KEY)
  LocalStorageUtil.removeItem(Constant.CURRENT_APP_NAME_KEY)
});
</script>

<style scoped>
.container {
  height: 100vh;
  margin: 0;
  padding: 0;
  background: #324157;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.main {
  background-color: transparent;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  width: 45%;
}

.app-label {
  color: white;
  margin-bottom: 10px;
  font-size: 14px;
}

.app-list {
  box-sizing: border-box;
  background-color: white;
  padding: 15px;
  width: 100%;
  border-radius: 5px;
}

.button-container {
  box-sizing: border-box;
  background-color: white;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.delete-button {
  margin-left: 10px;
}

.table {
  font-size: 14px;
  margin-top: 15px;
}
</style>
