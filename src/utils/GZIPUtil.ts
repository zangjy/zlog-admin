import pako from 'pako';

class GZIPUtil {
    static compressString(data: string): string {
        if (data.length === 0) {
            return '';
        }
        try {
            const encoder = new TextEncoder();
            const inputBytes = encoder.encode(data);
            const compressedBytes = pako.gzip(inputBytes);
            return btoa(String.fromCharCode(...new Uint8Array(compressedBytes)));
        } catch (e) {
            console.error(e);
            return '';
        }
    }

    static deCompressString(data: string): string {
        if (data.length === 0) {
            return '';
        }
        try {
            const compressedBytes = new Uint8Array(atob(data).split('').map(char => char.charCodeAt(0)));
            const decompressedBytes = pako.ungzip(compressedBytes);
            const decoder = new TextDecoder();
            return decoder.decode(decompressedBytes);
        } catch (e) {
            console.error(e);
            return '';
        }
    }
}

export default GZIPUtil;
