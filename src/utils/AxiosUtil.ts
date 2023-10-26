import axios, {AxiosInstance, AxiosRequestConfig, AxiosResponse} from 'axios';
import Constant from "../constant/Constant";
import LocalStorageUtil from "./LocalStorageUtil";
import GZIPUtil from "./GZIPUtil";
import AESUtil from "./AESUtil";
import CommonUtil from "./CommonUtil";

class AxiosUtil {
    private instance: AxiosInstance;

    constructor(baseURL: string) {
        this.instance = axios.create({
            baseURL: baseURL,
        });

        this.instance.interceptors.request.use(this.requestInterceptor.bind(this));
        this.instance.interceptors.response.use(this.responseInterceptor.bind(this));
    }

    private requestInterceptor(config: AxiosRequestConfig): AxiosRequestConfig {
        const headers = config.headers || {};

        headers['SESSION_ID'] = LocalStorageUtil.getItem<string>(Constant.SESSION_ID_KEY, "");
        headers['TOKEN'] = LocalStorageUtil.getItem<string>(Constant.TOKEN_KEY, "");

        if (config.method !== 'get') {
            if (typeof config.url === 'string' && this.shouldProcessData(config.url)) {
                const sharedSecret = LocalStorageUtil.getItem<string>(Constant.SHARED_SECRET_KEY, "");
                config.data = AESUtil.encryptString(GZIPUtil.compressString(JSON.stringify(config.data)), sharedSecret);
            }
        }

        return config;
    }

    private responseInterceptor(response: AxiosResponse): AxiosResponse {
        if (typeof response.config.url === 'string' && this.shouldProcessData(response.config.url)) {
            const sharedSecret = LocalStorageUtil.getItem<string>(Constant.SHARED_SECRET_KEY, "");

            let decryptString = AESUtil.decryptString(response.data, sharedSecret);

            let deCompressString = GZIPUtil.deCompressString(decryptString);

            //解密失败或者解压失败均需要重新登录
            if (decryptString === "" || deCompressString === "") {
                CommonUtil.logout(true);
            }

            response.data = JSON.parse(deCompressString);
        }

        return response;
    }

    private shouldProcessData(url: string): boolean {
        const unNeedUrls = [
            Constant.EXCHANGE_PUB_KEY_PATH,
            Constant.VERIFY_SHARED_KEY_PATH,
        ];

        return !unNeedUrls.some(unNeedUrl => url.endsWith(unNeedUrl));
    }

    public get<T = any>(url: string, params?: any): Promise<T> {
        return this.instance.get(url, {params}).then(response => response.data);
    }

    public post<T = any>(url: string, data?: any): Promise<T> {
        return this.instance.post(url, data).then(response => response.data);
    }
}

export default new AxiosUtil('http://192.168.2.188:20000/api/v1');
