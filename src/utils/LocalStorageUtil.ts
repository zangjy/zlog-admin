class LocalStorageUtil {
    static getItem<T>(key: string, defaultValue: T): T {
        try {
            const data = localStorage.getItem(key);
            if (data) {
                return JSON.parse(data) as T;
            }
            return defaultValue;
        } catch (error) {
            console.error(error);
            return defaultValue;
        }
    }

    static setItem<T>(key: string, value: T): void {
        try {
            const data = JSON.stringify(value);
            localStorage.setItem(key, data);
        } catch (error) {
            console.error(error);
        }
    }

    static removeItem(key: string): void {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error(error);
        }
    }
}

export default LocalStorageUtil;
