import { BitArray } from './bitarray';
export interface IBitMatrix {
    readonly width: number;
    readonly height: number;
    get(x: number, y: number): boolean;
    set(x: number, y: number): void;
    unset(x: number, y: number): void;
    setRegion(left: number, top: number, width: number, height: number): void;
    toBooleanArray(): boolean[][];
    toNumberArray(): number[];
}
export declare class BitMatrix implements IBitMatrix {
    width: number;
    height: number;
    data: BitArray;
    constructor(width: number, height?: number);
    get(x: number, y: number): boolean;
    set(x: number, y: number): void;
    unset(x: number, y: number): void;
    setRegion(left: number, top: number, width: number, height: number): void;
    copyBit(x: number, y: number, versionBits: number): number;
    mirror(): void;
    toBooleanArray(): boolean[][];
    toNumberArray(): number[];
}
