import CryptoJS from 'crypto-js';

class AESUtil {
    private static IV_LENGTH = 16;

    static encryptString(data: string, key: string): string {
        if (!data || !key) {
            return '';
        }

        try {
            const iv = CryptoJS.lib.WordArray.random(this.IV_LENGTH);
            const adjustedKey = CryptoJS.enc.Utf8.parse(this.adjustKeySize(key));

            const encrypted = CryptoJS.AES.encrypt(data, adjustedKey, {
                iv: iv,
                mode: CryptoJS.mode.CFB,
                padding: CryptoJS.pad.NoPadding
            });

            const combined = iv.concat(encrypted.ciphertext);

            return CryptoJS.enc.Base64.stringify(combined);
        } catch (error) {
            console.error(error);
            return '';
        }
    }

    static decryptString(data: string, key: string): string {
        if (!data || !key) {
            return '';
        }

        try {
            const combined = CryptoJS.enc.Base64.parse(data);

            const iv = combined.clone();
            iv.sigBytes = this.IV_LENGTH;
            iv.clamp();

            const adjustedKey = CryptoJS.enc.Utf8.parse(this.adjustKeySize(key));

            const ciphertext = combined.clone();
            ciphertext.words.splice(0, 4);
            ciphertext.sigBytes -= this.IV_LENGTH;

            const decrypted = CryptoJS.AES.decrypt({ciphertext: ciphertext} as CryptoJS.lib.CipherParams, adjustedKey, {
                iv: iv,
                mode: CryptoJS.mode.CFB,
                padding: CryptoJS.pad.NoPadding
            });

            return CryptoJS.enc.Utf8.stringify(decrypted);
        } catch (error) {
            console.error(error);
            return '';
        }
    }

    // private static adjustKeySize(key: string): string {
    //     const validKeySizes = [16, 24, 32];
    //     const keyLength = key.length;
    //
    //     if (validKeySizes.includes(keyLength)) {
    //         return key;
    //     } else if (keyLength < 16) {
    //         return key.padEnd(16, '0');
    //     } else if (keyLength < 24) {
    //         return key.padEnd(24, '0');
    //     } else {
    //         return key.substring(0, 32);
    //     }
    // }

    private static adjustKeySize(key: string): string {
        const keyLength = key.length;

        if (keyLength === 16) {
            return key;
        } else if (keyLength < 16) {
            return key.padEnd(16, '0');
        } else {
            return key.substring(0, 16);
        }
    }
}

export default AESUtil;
