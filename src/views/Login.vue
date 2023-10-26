<template>
  <div class="login-wrap">
    <div class="ms-login">
      <div class="ms-title">后台管理系统</div>
      <el-form :model="param" :rules="rules" ref="loginRef" label-width="0px" class="ms-content">
        <el-form-item prop="username">
          <el-input v-model="param.username" placeholder="用户名">
            <template #prepend>
              <el-button icon="User"/>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input type="password" placeholder="密码" v-model="param.password" @keyup.enter="submitForm(loginRef)">
            <template #prepend>
              <el-button icon="Lock"/>
            </template>
          </el-input>
        </el-form-item>
        <div class="login-btn">
          <el-button type="primary" @click="submitForm(loginRef)">登录</el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import {onMounted, reactive, ref} from 'vue';
import {useTagsStore} from '../store/Tags';
import {useRouter} from 'vue-router';
import type {FormInstance, FormRules} from 'element-plus';
import {ElMessage} from 'element-plus';
import CommonUtil from '../utils/CommonUtil';
import LocalStorageUtil from '../utils/LocalStorageUtil';
import Constant from "../constant/Constant";
import {getSessionId, login, verifySharedKey, VerifySharedKeyModel} from "../api/Api";

interface LoginInfo {
  username: string;
  password: string;
}

const router = useRouter();

const param = reactive<LoginInfo>({
  username: '',
  password: ''
});

const rules: FormRules = {
  username: [
    {
      required: true,
      message: '请输入用户名',
      trigger: 'blur'
    }
  ],
  password: [{required: true, message: '请输入密码', trigger: 'blur'}]
};

const loginRef = ref<FormInstance>();

const submitForm = (formEl: FormInstance | undefined) => {
  if (formEl) {
    formEl.validate(async (valid: boolean) => {
      if (valid) {
        let loginModel = await login(param.username, param.password);
        if (loginModel.status === Constant.SUCCESS_CODE) {
          //保存token
          LocalStorageUtil.setItem(Constant.TOKEN_KEY, loginModel.token);
          //如果已经选择了应用，则直接跳转到在线日志页面，否则跳转到应用列表页面
          if (LocalStorageUtil.getItem<string>(Constant.CURRENT_APP_ID_KEY, "") === "") {
            await router.push('/apps');
          } else {
            await router.push('/deviceList');
          }
        } else {
          ElMessage.error(loginModel.err_msg);
        }
      }
    });
  }
};

const tags = useTagsStore();
tags.clearTags();

onMounted(async () => {
  let sessionId = LocalStorageUtil.getItem<string>(Constant.SESSION_ID_KEY, "");
  let sharedSecret = LocalStorageUtil.getItem<string>(Constant.SHARED_SECRET_KEY, "");
  let token = LocalStorageUtil.getItem<string>(Constant.TOKEN_KEY, "");

  //验证共享密钥
  if (sessionId.length > 0 && sharedSecret.length > 0 && token.length > 0) {
    CommonUtil.processResult<VerifySharedKeyModel>(await verifySharedKey(sessionId, "测试", sharedSecret), async (verifySharedKeyModel) => {
      if (verifySharedKeyModel.decrypt_data === "测试") {
        await router.push('/apps');
      } else {
        await getSessionId();
      }
    });
  } else {
    await getSessionId();
  }
})
</script>

<style scoped>
.login-wrap {
  position: relative;
  width: 100%;
  height: 100%;
  background-image: url(../assets/img/login-bg.jpg);
  background-size: 100%;
}

.ms-title {
  width: 100%;
  line-height: 50px;
  text-align: center;
  font-size: 20px;
  color: #fff;
}

.ms-login {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 350px;
  margin: -190px 0 0 -175px;
  border-radius: 5px;
  background: rgba(255, 255, 255, 0.3);
  overflow: hidden;
}

.ms-content {
  padding: 30px 30px;
}

.login-btn {
  text-align: center;
}

.login-btn button {
  width: 100%;
  height: 36px;
  margin-bottom: 10px;
}
</style>
