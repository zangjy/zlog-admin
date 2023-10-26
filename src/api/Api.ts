import ECDHUtil from "../utils/ECDHUtil";
import CommonUtil from "../utils/CommonUtil";
import LocalStorageUtil from "../utils/LocalStorageUtil";
import Constant from "../constant/Constant";
import AxiosUtil from "../utils/AxiosUtil";
import AESUtil from "../utils/AESUtil";

/**
 * 默认返回数据模型
 */
export interface BaseModel {
    status: string;
    err_msg: string;
}

/**
 * 获取会话ID
 */
export const getSessionId = async () => {
    //生成密钥对
    const keyPair = await ECDHUtil.generateKeyPair();

    //交换公钥
    CommonUtil.processResult<ExchangePubKeyModel>(await exchangePubKey(keyPair.publicKeyBase64), async (exchangePubKeyModel) => {
        //计算共享密钥
        const sharedSecret = await ECDHUtil.generateSharedSecret(exchangePubKeyModel.server_pub_key, keyPair.privateKeyBase64)

        //共享密钥验证
        CommonUtil.processResult<VerifySharedKeyModel>(await verifySharedKey(exchangePubKeyModel.tmp_session_id, "测试", sharedSecret), async (verifySharedKeyModel) => {
            if (verifySharedKeyModel.decrypt_data === "测试") {
                //保存共享密钥和会话ID
                LocalStorageUtil.setItem(Constant.SHARED_SECRET_KEY, sharedSecret)
                LocalStorageUtil.setItem(Constant.SESSION_ID_KEY, exchangePubKeyModel.tmp_session_id)
            }
        });
    });
};

/**
 * 交换公钥数据模型
 */
export interface ExchangePubKeyModel extends BaseModel {
    server_pub_key: string;
    tmp_session_id: string;
}

/**
 * 交换公钥
 * @param pubKey 本地公钥
 */
export const exchangePubKey = async (pubKey: string) => {
    return AxiosUtil.post(Constant.EXCHANGE_PUB_KEY_PATH, {
        "client_pub_key": pubKey,
        "expire_seconds": 3600 * 24 * 7,
    });
};

/**
 * 共享密钥验证数据模型
 */
export interface VerifySharedKeyModel extends BaseModel {
    decrypt_data: string;
}

/**
 * 共享密钥验证
 * @param sessionId 会话ID
 * @param data 验证数据
 * @param sharedSecret 共享密钥
 */
export const verifySharedKey = async (sessionId: string, data: string, sharedSecret: string) => {
    return AxiosUtil.post(Constant.VERIFY_SHARED_KEY_PATH, {
        "tmp_session_id": sessionId,
        "verify_data": AESUtil.encryptString(data, sharedSecret)
    });
};

/**
 * 登录数据模型
 */
export interface LoginModel extends BaseModel {
    token: string;
}

/**
 * 登录
 * @param userName 用户名
 * @param passWord 密码
 */
export const login = async (userName: string, passWord: string) => {
    return AxiosUtil.post(Constant.LOGIN_PATH, {
        "user_name": userName,
        "password": passWord,
    });
}

/**
 * 创建应用数据模型
 */
export interface CreateAppModel extends BaseModel {
    app_id: string;
}

/**
 * 创建应用
 * @param appName 应用名称
 */
export const CreateApp = async (appName: string) => {
    return AxiosUtil.post(Constant.CREATE_APP_PATH, {"app_name": appName})
}

/**
 * 应用列表数据模型
 */
export interface AppListModel extends BaseModel {
    count: number;
    data: AppModel[];
}

/**
 * 应用数据模型
 */
export interface AppModel {
    app_name: string;
    app_id: string;
    create_time: number;
}

/**
 * 获取应用列表数据模型
 * @param page 页码
 */
export const GetAppList = async (page: number) => {
    return AxiosUtil.get(Constant.GET_APP_LIST_PATH, {"page": page})
}

/**
 * 删除应用
 * @param appId 应用ID
 */
export const DeleteApp = async (appId: string) => {
    return AxiosUtil.post(Constant.DELETE_APP_PATH, {"app_id": appId})
}

/**
 * 设备列表数据模型
 */
export interface DeviceListModel extends BaseModel {
    count: number;
    data: DeviceModel[];
}

/**
 * 设备数据模型
 */
export interface DeviceModel {
    device_type: number;
    device_name: string;
    device_id: string;
    session_id: string;
}

/**
 * 查询设备列表
 * @param appId 应用ID
 * @param identify 附加字段
 * @param page 页码
 */
export const GetDeviceList = async (appId: string, identify: string, page: number) => {
    return AxiosUtil.get(Constant.GET_DEVICE_LIST_PATH, {"app_id": appId, "identify": identify, "page": page})
}

/**
 * 创建回捞任务
 * @param appId 应用ID
 * @param taskDes 任务描述
 * @param sessionId 会话ID
 * @param deviceType 设备类型
 * @param startTime 开始日期
 * @param endTime 结束日期
 */
export const CreateTask = async (appId: string, taskDes: string, sessionId: string, deviceType: number, startTime: number, endTime: number) => {
    return AxiosUtil.post(Constant.CREATE_TASK_PATH, {
        "app_id": appId,
        "task_des": taskDes,
        "session_id": sessionId,
        "device_type": deviceType,
        "start_time": startTime,
        "end_time": endTime
    })
}

/**
 * 获取全部任务数据模型
 */
export interface GetAllTaskModel extends BaseModel {
    count: number;
    data: TaskModel[];
}

/**
 * 任务数据模型
 */
export interface TaskModel {
    task_des: string;
    session_id: string;
    device_type: number;
    start_time: number;
    end_time: number;
    task_id: string;
    state: number;
    msg: string;
}

/**
 * 获取全部任务
 * @param appId 应用ID
 * @param taskDes 任务描述
 * @param page 页码
 */
export const GetAllTask = async (appId: string, taskDes: string, page: number) => {
    return AxiosUtil.get(Constant.GET_ALL_TASK_PATH, {"app_id": appId, "task_des": taskDes, "page": page})
}

/**
 * 删除任务
 * @param taskId 任务ID
 */
export const DeleteTask = async (taskId: string) => {
    return AxiosUtil.post(Constant.DELETE_TASK_PATH, {"task_id": taskId})
}

/**
 * 获取日志数据模型
 */
export interface GetLogListModel extends BaseModel {
    count: number;
    data: LogModel[];
}

/**
 *
 */
export interface LogModel {
    sequence: number;
    system_version: string;
    app_version: string;
    time_stamp: number;
    log_level: number;
    identify: string;
    tag: string;
    msg: string;
}

/**
 * 获取设备日志数据模型
 * @param isOnline 是否是实时日志
 * @param page 页码
 * @param id 任务ID或会话ID
 * @param systemVersion 系统版本
 * @param appVersion 应用版本
 * @param startStamp 开始时间戳
 * @param endStamp 结束时间戳
 * @param logLevel 日志等级
 * @param identify 附加字段
 * @param tag 标签
 * @param msg 消息
 */
export const GetLogList = async (isOnline: boolean, page: number, id: string, systemVersion: string, appVersion: string, startStamp: string, endStamp: string, logLevel: string, identify: string, tag: string, msg: string) => {
    if (isOnline) {
        return AxiosUtil.get(Constant.GET_DEVICE_LOG_PATH, {
            "page": page,
            "session_id": id,
            "system_version": systemVersion,
            "app_version": appVersion,
            "start_stamp": startStamp,
            "end_stamp": endStamp,
            "log_level": logLevel,
            "identify": identify,
            "tag": tag,
            "msg": msg
        })
    } else {
        return AxiosUtil.get(Constant.GET_TASK_LOG_PATH, {
            "page": page,
            "task_id": id,
            "system_version": systemVersion,
            "app_version": appVersion,
            "start_stamp": startStamp,
            "end_stamp": endStamp,
            "log_level": logLevel,
            "identify": identify,
            "tag": tag,
            "msg": msg
        })
    }
}
