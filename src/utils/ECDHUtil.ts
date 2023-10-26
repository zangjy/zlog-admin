class ECDHUtil {
    private static DEFAULT_PUBLIC_KEY = "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEWuCa7IySk1avuQODG/xubWN2+vBVEKMjWhQ2Pm9iGC3nZObWct7xQfNmT6EXFk92/OyiHCwG56tQa7La+V45sA==";
    private static DEFAULT_PRIVATE_KEY = "MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgW05ayM+XRxNR2z7wCxw+Bi0FNYEpT2pOHw9LpPVf7FChRANCAARa4JrsjJKTVq+5A4Mb/G5tY3b68FUQoyNaFDY+b2IYLedk5tZy3vFB82ZPoRcWT3b87KIcLAbnq1Brstr5Xjmw";

    static async generateKeyPair(): Promise<{ publicKeyBase64: string, privateKeyBase64: string }> {
        try {
            const keyPair = await crypto.subtle.generateKey({
                name: "ECDH",
                namedCurve: "P-256",
            }, true, ["deriveKey", "deriveBits"]);

            const publicKeyExported = await crypto.subtle.exportKey("spki", keyPair.publicKey);
            const privateKeyExported = await crypto.subtle.exportKey("pkcs8", keyPair.privateKey);

            const publicKeyBase64 = btoa(String.fromCharCode(...new Uint8Array(publicKeyExported)));
            const privateKeyBase64 = btoa(String.fromCharCode(...new Uint8Array(privateKeyExported)));

            return {publicKeyBase64, privateKeyBase64};
        } catch (e) {
            console.error(e);
            return {publicKeyBase64: ECDHUtil.DEFAULT_PUBLIC_KEY, privateKeyBase64: ECDHUtil.DEFAULT_PRIVATE_KEY};
        }
    }

    static async generateSharedSecret(publicKeyBase64: string, privateKeyBase64: string): Promise<string> {
        try {
            const publicKeyArrayBuffer = ECDHUtil.base64ToArrayBuffer(publicKeyBase64);
            const privateKeyArrayBuffer = ECDHUtil.base64ToArrayBuffer(privateKeyBase64);

            const publicKey = await crypto.subtle.importKey("spki", publicKeyArrayBuffer, {
                name: "ECDH",
                namedCurve: "P-256",
            }, false, []);

            const privateKey = await crypto.subtle.importKey("pkcs8", privateKeyArrayBuffer, {
                name: "ECDH",
                namedCurve: "P-256",
            }, false, ["deriveKey"]);

            const sharedKey = await crypto.subtle.deriveKey({
                name: "ECDH",
                public: publicKey,
            }, privateKey, {name: "AES-GCM", length: 256}, true, ["encrypt", "decrypt"]);

            const sharedKeyExported = await crypto.subtle.exportKey("raw", sharedKey);

            return btoa(String.fromCharCode(...new Uint8Array(sharedKeyExported)));
        } catch (e) {
            console.error(e);
            return "";
        }
    }

    private static base64ToArrayBuffer(base64: string): ArrayBuffer {
        const binaryString = atob(base64);
        const arrayBuffer = new ArrayBuffer(binaryString.length);
        const uint8Array = new Uint8Array(arrayBuffer);

        for (let i = 0; i < binaryString.length; i++) {
            uint8Array[i] = binaryString.charCodeAt(i);
        }

        return arrayBuffer;
    }
}

export default ECDHUtil;
