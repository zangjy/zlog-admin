<template>
  <div>
    <div class="container">
      <div class="handle-box">
        <el-input v-model="query.systemVersion" placeholder="系统版本" class="filter"></el-input>
        <el-input v-model="query.appVersion" placeholder="应用版本" class="filter"></el-input>
        <el-date-picker v-model="query.startStamp" type="datetime" placeholder="起始时间"
                        class="filter width200"></el-date-picker>
        <el-date-picker v-model="query.endStamp" type="datetime" placeholder="截止时间"
                        class="filter width200"></el-date-picker>
        <el-select v-model="query.logLevel" placeholder="日志级别" class="filter">
          <el-option v-for="option in logLevelOptions" :label="option.label" :value="option.value"
                     :key="option.value"></el-option>
        </el-select>
        <el-input v-model="query.identify" placeholder="自定义标识" class="filter"></el-input>
        <el-input v-model="query.tag" placeholder="标签" class="filter"></el-input>
        <el-input v-model="query.msg" placeholder="日志内容" class="filter width200"></el-input>
        <el-button type="primary" icon="Search" @click="handleSearch">搜索</el-button>
      </div>

      <el-table :data="tableData" border class="table" ref="multipleTable" header-cell-class-name="table-header">
        <el-table-column prop="sequence" label="序号" width="100"></el-table-column>
        <el-table-column prop="system_version" label="系统版本" width="100"></el-table-column>
        <el-table-column prop="app_version" label="应用版本" width="100"></el-table-column>
        <el-table-column prop="time_stamp" label="发生时间" width="200" :formatter="timeFormat"></el-table-column>
        <el-table-column prop="log_level" label="日志级别" width="100">
          <template #default="{ row }">
            <div style="text-align: center;">
              <el-tag :type="getLevelType(row.log_level)">
                {{ getLevelDes(row.log_level) }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="identify" label="自定义标识" width="200"></el-table-column>
        <el-table-column prop="tag" label="标签" width="200"></el-table-column>
        <el-table-column prop="msg" label="日志内容">
          <template #default="{ row }">
            <div class="log-content">
              <span class="log-content-text">{{ row.msg }}</span>
              <div class="view-button-container">
                <el-button link class="view-button" @click="showLogDetails(row.msg)">查看</el-button>
              </div>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <el-dialog v-model="logDetailsDialog" title="日志内容" width="50%">
        <div class="log-details">
          <pre v-if="isJSON(logDetails)"
               style="white-space: pre-wrap; word-wrap: break-word; overflow-wrap: break-word;">{{
              prettifyJSON(logDetails)
            }}</pre>
          <div v-else style="white-space: pre-wrap; word-wrap: break-word; overflow-wrap: break-word;">
            {{ logDetails }}
          </div>
        </div>
      </el-dialog>

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
import {reactive, ref} from "vue";
import {useRouter} from "vue-router";
import CommonUtil from "../utils/CommonUtil";
import {GetLogList, GetLogListModel, LogModel} from "../api/Api";

const logLevelOptions = [
  {label: "不限", value: "-1"},
  {label: "INFO", value: "0"},
  {label: "DEBUG", value: "1"},
  {label: "VERBOSE", value: "2"},
  {label: "WARN", value: "3"},
  {label: "ERROR", value: "4"}
];

const router = useRouter();

const id = ref('');

const type = ref('');

const query = reactive({
  systemVersion: '',
  appVersion: '',
  startStamp: '',
  endStamp: '',
  logLevel: '-1',
  identify: '',
  tag: '',
  msg: '',
  pageIndex: 1,
  pageSize: 10
});

const tableData = ref<LogModel[]>([]);

const pageTotal = ref(0);

const idParam = router.currentRoute.value.query.id;
const typeParam = router.currentRoute.value.query.type;

if (typeof idParam === 'string') {
  id.value = idParam;
} else {
  id.value = '';
}

if (typeof typeParam === 'string') {
  type.value = typeParam;
} else {
  type.value = '';
}

const getData = async () => {
  const startDateTimestamp = query.startStamp ? new Date(query.startStamp).getTime() / 1000 : 0;
  const endDateTimestamp = query.endStamp ? new Date(query.endStamp).getTime() / 1000 : 0;

  CommonUtil.processResult<GetLogListModel>(await GetLogList(type.value === "online", query.pageIndex, id.value, query.systemVersion, query.appVersion, startDateTimestamp == 0 ? "" : startDateTimestamp.toString(), endDateTimestamp == 0 ? '' : endDateTimestamp.toString(), query.logLevel, query.identify, query.tag, query.msg), (result) => {
    tableData.value = result.data;
    if (pageTotal.value === 0) {
      pageTotal.value = result.count;
    }
  });
};

getData();

const handleSearch = () => {
  query.pageIndex = 1;
  pageTotal.value = 0;
  getData();
};

const handlePageChange = (val: number) => {
  query.pageIndex = val;
  getData();
};

const timeFormat = (row: LogModel) => {
  return CommonUtil.dateFormat(row.time_stamp, 'YYYY-MM-DD HH:mm:ss');
};

const getLevelType = (level: number) => {
  switch (level) {
    case 0:
      return 'success';
    case 1:
      return '';
    case 3:
      return 'warning';
    case 4:
      return 'danger';
    default:
      return 'info';
  }
};

const getLevelDes = (level: number) => {
  switch (level) {
    case 0:
      return 'INFO';
    case 1:
      return 'DEBUG';
    case 3:
      return 'WARN';
    case 4:
      return 'ERROR';
    default:
      return 'VERBOSE';
  }
};

const logDetailsDialog = ref(false);
const logDetails = ref('');

const showLogDetails = (log: string) => {
  logDetails.value = log;
  logDetailsDialog.value = true;
};

const isJSON = (str: string) => {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
};

const prettifyJSON = (str: string) => {
  try {
    const json = JSON.parse(str);
    return JSON.stringify(json, null, 2);
  } catch (e) {
    return str;
  }
};
</script>

<style scoped>
.handle-box {
  margin-bottom: 20px;
}

.table {
  width: 100%;
  font-size: 14px;
}

.filter {
  width: 150px;
  margin-right: 10px;
}

:deep(.filter) {
  width: 150px;
  margin-right: 10px;
}

.width200 {
  width: 200px;
}

:deep(.width200) {
  width: 200px;
}

.log-content {
  display: flex;
  align-items: center;
}

.log-content-text {
  flex: 1;
  max-width: 90%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-right: 10px;
}

.view-button-container {
  display: flex;
  align-items: center;
}

.view-button {
  padding: 0;
  font-size: 14px;
  color: #1890ff;
  cursor: pointer;
}

.log-details {
  white-space: pre-wrap;
}
</style>
