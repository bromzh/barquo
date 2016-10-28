import { BarcodeFormat } from './format';

export interface Result {
    readonly text: string;
    readonly raw: number[];
    readonly format: BarcodeFormat;
}

export function byteArrayToString(bytes: number[]): string {
    let str = '';
    if (bytes !== null && bytes !== undefined) {
        for (let i = 0; i < bytes.length; i++) {
            str += String.fromCharCode(bytes[i]);
        }
    }
    return str;
}
