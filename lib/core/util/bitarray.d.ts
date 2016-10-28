export interface IBitArray {
    readonly length: number;
    readonly byteLength: number;
    get(idx: number): boolean;
    set(idx: number): void;
    unset(idx: number): void;
    toBooleanArray(): boolean[];
    toNumberArray(): number[];
    toArrayBuffer(): ArrayBuffer;
}
export declare class BitArray implements IBitArray {
    length: number;
    readonly byteLength: number;
    bits: Int8Array;
    constructor(length?: number);
    get(idx: number): boolean;
    set(idx: number): void;
    unset(idx: number): void;
    toBooleanArray(): boolean[];
    toNumberArray(): number[];
    toArrayBuffer(): ArrayBuffer;
    private outOfRange(idx);
}
