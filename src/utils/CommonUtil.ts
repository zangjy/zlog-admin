import LocalStorageUtil from "./LocalStorageUtil";
import Router from '../router/Router';
import moment from "moment";
import Constant from "../constant/Constant";
import {BaseModel} from "../api/Api";
import {ElMessage} from "element-plus";

class CommonUtil {
    static processResult<T extends BaseModel>(model: any, successCallback: (model: T) => void): void {
        if (model.status === Constant.SUCCESS_CODE) {
            successCallback(model);
        } else {
            const commonErrors = ['Token不能为空', '无效Token', 'Token已过期', '帐号不存在', 'SESSION_ID不能为空', '未找到此客户端的密钥对，请先和服务端进行公钥交换'];

            if (commonErrors.includes(model.err_msg)) {
                this.logout(true);
            } else {
                ElMessage.error(model.err_msg);
            }
        }
    }

    static logout(isExpiration: boolean = false): void {
        if (isExpiration) {
            ElMessage.error('登录过期，请重新登录');
        } else {
            LocalStorageUtil.removeItem(Constant.CURRENT_APP_ID_KEY)
            LocalStorageUtil.removeItem(Constant.CURRENT_APP_NAME_KEY)
        }
        LocalStorageUtil.removeItem(Constant.SESSION_ID_KEY);
        LocalStorageUtil.removeItem(Constant.TOKEN_KEY);
        LocalStorageUtil.removeItem(Constant.SHARED_SECRET_KEY);
        // 跳转到登录页面
        Router.push('/login').then(r => {

        });
    }

    static dateFormat(secondsTimestamp: number, format: string = "YYYY-MM-DD"): string {
        if (secondsTimestamp === undefined) {
            return "";
        }
        const millisecondsTimestamp = secondsTimestamp * 1000;

        if (format === "YYYY-MM-DD HH:mm:ss") {
            return moment(millisecondsTimestamp).format("YYYY-MM-DD HH:mm:ss");
        } else if (format === "YYYY-MM-DD") {
            return moment(millisecondsTimestamp).format("YYYY-MM-DD");
        } else {
            return "Invalid format";
        }
    }
}

export default CommonUtil;
