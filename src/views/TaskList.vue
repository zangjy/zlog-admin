<template>
  <div>
    <div class="container">
      <div class="handle-box">
        <el-input v-model="query.taskDes" placeholder="按照任务描述搜索" class="handle-input mr10"></el-input>
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
        <el-table-column prop="task_des" label="任务描述"></el-table-column>
        <el-table-column prop="start_time" label="起始日期" width="125" :formatter="startTimeFormat"></el-table-column>
        <el-table-column prop="end_time" label="截止日期" width="125" :formatter="endTimeFormat"></el-table-column>
        <el-table-column prop="state" label="任务状态" width="100">
          <template #default="{ row }">
            <div style="text-align: center;">
              <el-tag :type="getStateType(row.state)">
                {{ getStateLabel(row.state) }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="msg" label="失败反馈" width="300"></el-table-column>
        <el-table-column prop="task_id" label="任务ID" width="170"></el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button type="danger" size="small" @click="deleteTask(row)" class="action-button">删除任务</el-button>
            <el-button v-if="row.state === 4" type="primary" size="small" @click="viewLog(row)" class="action-button">
              查看日志
            </el-button>
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
    </div>
  </div>
</template>

<script setup lang="ts">
import {onMounted, reactive, ref} from "vue";
import LocalStorageUtil from "../utils/LocalStorageUtil";
import Constant from "../constant/Constant";
import {useRouter} from "vue-router";
import {ElMessage, ElMessageBox} from "element-plus";
import CommonUtil from "../utils/CommonUtil";
import {BaseModel, DeleteTask, GetAllTask, GetAllTaskModel, TaskModel} from "../api/Api";

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
  taskDes: '',
  pageIndex: 1,
  pageSize: 10
});

const tableData = ref<TaskModel[]>([]);

const pageTotal = ref(0);

const getData = async () => {
  CommonUtil.processResult<GetAllTaskModel>(await GetAllTask(LocalStorageUtil.getItem<string>(Constant.CURRENT_APP_ID_KEY, ""), query.taskDes, query.pageIndex), (result) => {
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

const startTimeFormat = (row: TaskModel) => {
  return CommonUtil.dateFormat(row.start_time);
};

const endTimeFormat = (row: TaskModel) => {
  return CommonUtil.dateFormat(row.end_time);
};

const getStateType = (state: number) => {
  switch (state) {
    case 0:
      return 'info';
    case 1:
      return 'warning';
    case 3:
      return 'danger';
    case 4:
      return 'success';
    default:
      return '';
  }
};

const getStateLabel = (state: number) => {
  switch (state) {
    case 0:
      return '等待响应';
    case 1:
      return '无法响应';
    case 3:
      return '解析失败';
    case 4:
      return '任务完成';
    default:
      return '正在解析';
  }
};

const viewLog = (row: TaskModel) => {
  router.push('/logList?type=offline&id=' + row.task_id + '&title=' + row.task_des + '[离线日志]');
};

const deleteTask = (row: TaskModel) => {
  ElMessageBox.confirm('您确定要删除该任务吗？', '', {type: 'warning'}).then(async () => {
    const indexToDelete = tableData.value.findIndex(item => item.task_id === row.task_id);
    CommonUtil.processResult<BaseModel>(await DeleteTask(row.task_id), (result) => {
      tableData.value.splice(indexToDelete, 1);
    });
  }).catch(() => {
  });
}
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
</style>
