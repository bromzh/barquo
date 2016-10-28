import { BarcodeFormat } from './format';
export interface Result {
    readonly text: string;
    readonly raw: number[];
    readonly format: BarcodeFormat;
}
export declare function byteArrayToString(bytes: number[]): string;
