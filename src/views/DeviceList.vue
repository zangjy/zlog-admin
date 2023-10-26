<template>
  <div>
    <div class="container">
      <div class="handle-box">
        <el-input v-model="query.identify" placeholder="按照自定义标识搜索" class="handle-input mr10"></el-input>
        <el-button type="primary" icon="Search" @click="handleSearch">搜索</el-button>
      </div>
      <el-table :data="tableData" border class="table" ref="multipleTable" header-cell-class-name="table-header">
        <el-table-column prop="device_type" label="设备类型" width="150" align="center">
          <template #default="{ row }">
            <!-- 当 device_type 为1时，显示"Android" -->
            <span v-if="row.device_type === 1">Android</span>
            <!-- 当 device_type 为2时，显示"IOS" -->
            <span v-else-if="row.device_type === 2">IOS</span>
            <!-- 其他情况显示设备类型的原始值 -->
            <span v-else>{{ row.device_type }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="device_name" label="设备名称"></el-table-column>
        <el-table-column prop="device_id" label="设备ID"></el-table-column>
        <el-table-column prop="session_id" label="会话ID"></el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="onlineLog(row)">实时日志</el-button>
            <el-button size="small" @click="showCreateTaskDialog(row)" class="createTask">创建任务</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination">
        <el-pagination
            background
            layout="total, prev, pager, next"
            :current-page="query.pageIndex"
            :page-size="query.pageSize"
            :total="pageTotal"
            @current-change="handlePageChange"
        ></el-pagination>
      </div>

      <el-dialog title="创建回捞任务" v-model="createTaskDialogVisible" width="30%">
        <el-form :model="taskForm" label-width="70px">
          <el-form-item label="会话ID">
            <el-input v-model="taskForm.session_id" disabled placeholder="请先选择会话ID"></el-input>
          </el-form-item>
          <el-form-item label="任务描述">
            <el-input v-model="taskForm.description" placeholder="请输入任务描述"></el-input>
          </el-form-item>
          <el-form-item label="设备类型">
            <el-checkbox-group v-model="taskForm.device_types">
              <el-checkbox label="1">Android</el-checkbox>
              <el-checkbox label="2">IOS</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
          <el-form-item label="起始日期">
            <el-date-picker v-model="taskForm.start_date" type="date" placeholder="请选择起始日期"></el-date-picker>
          </el-form-item>
          <el-form-item label="截止日期">
            <el-date-picker v-model="taskForm.end_date" type="date" placeholder="请选择截止日期"></el-date-picker>
          </el-form-item>
        </el-form>
        <template #footer>
        <span class="dialog-footer">
          <el-button @click="createTaskDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="createTask">确 定</el-button>
        </span>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import {onMounted, reactive, ref} from "vue";
import LocalStorageUtil from "../utils/LocalStorageUtil";
import Constant from "../constant/Constant";
import {useRouter} from "vue-router";
import {ElMessage} from "element-plus";
import CommonUtil from "../utils/CommonUtil";
import {CreateTask, DeviceListModel, DeviceModel, GetDeviceList} from "../api/Api";

const router = useRouter();

onMounted(() => {
  //如果APPID为空，跳转到应用列表页面
  let currentAppId = LocalStorageUtil.getItem<string>(Constant.CURRENT_APP_ID_KEY, "");
  if (currentAppId === "") {
    ElMessage.info('请先选择应用');
    router.push("/apps");
  }
});

const query = reactive({
  identify: '',
  pageIndex: 1,
  pageSize: 10
});

const tableData = ref<DeviceModel[]>([]);

const pageTotal = ref(0);

const getData = async () => {
  CommonUtil.processResult<DeviceListModel>(await GetDeviceList(LocalStorageUtil.getItem<string>(Constant.CURRENT_APP_ID_KEY, ""), query.identify, query.pageIndex), (result) => {
    tableData.value = result.data;
    if (pageTotal.value === 0) {
      pageTotal.value = result.count;
    }
  });
};

getData();

const handleSearch = () => {
  query.pageIndex = 1;
  getData();
};

const handlePageChange = (val: number) => {
  query.pageIndex = val;
  getData();
};

const createTaskDialogVisible = ref(false);

const taskForm = reactive({
  description: "",
  session_id: "",
  device_types: [],
  start_date: '',
  end_date: '',
});

const showCreateTaskDialog = (row: DeviceModel) => {
  createTaskDialogVisible.value = true;
  taskForm.session_id = row.session_id;
};

const createTask = async () => {
  createTaskDialogVisible.value = false;

  if (taskForm.description.length > 0 && taskForm.session_id.length > 0 && taskForm.device_types.length > 0) {
    const startDateTimestamp = new Date(taskForm.start_date).getTime() / 1000;
    const endDateTimestamp = new Date(taskForm.end_date).getTime() / 1000;

    if (startDateTimestamp > 0 && endDateTimestamp > 0 && startDateTimestamp <= endDateTimestamp) {
      let successCount = 0;
      for (let i = 0; i < taskForm.device_types.length; i++) {
        const deviceType = parseInt(taskForm.device_types[i], 10)
        CommonUtil.processResult(await CreateTask(LocalStorageUtil.getItem<string>(Constant.CURRENT_APP_ID_KEY, ""), taskForm.description, taskForm.session_id, deviceType, startDateTimestamp, endDateTimestamp), (result) => {
          successCount++;
        });
      }
      if (successCount === taskForm.device_types.length) {
        ElMessage.success("创建任务成功");
      } else {
        ElMessage.error(successCount + "个任务创建成功，" + (taskForm.device_types.length - successCount) + "个任务创建失败");
      }

      taskForm.description = "";
      taskForm.session_id = "";
      taskForm.device_types = [];
      taskForm.start_date = "";
      taskForm.end_date = "";
    }
  }
};

const onlineLog = (row: DeviceModel) => {
  router.push('/logList?type=online&id=' + row.session_id + '&title=' + row.device_name + '[实时日志]');
};
</script>

<style scoped>
.handle-box {
  margin-bottom: 20px;
}

.handle-input {
  width: 300px;
}

.table {
  width: 100%;
  font-size: 14px;
}

.mr10 {
  margin-right: 10px;
}

.createTask {
  margin-left: 10px;
}
</style>
