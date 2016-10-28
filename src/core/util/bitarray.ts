export interface IBitArray {
    readonly length: number;
    readonly byteLength: number;
    get(idx: number): boolean;
    set(idx: number): void;
    unset(idx: number): void;
    // flip(idx: number): void;

    toBooleanArray(): boolean[];
    toNumberArray(): number[];
    toArrayBuffer(): ArrayBuffer;
}

export class BitArray implements IBitArray {
    // length: number;


    get byteLength(): number {
        return this.bits.byteLength;
    }

    bits: Int8Array;

    constructor(public length: number = 0) {
        if (!Number.isInteger(length)) { // TODO add polyfill
            throw new RangeError(`Invalid length (safe) ${length}`);
        }
        if (length < 0) {
            throw new RangeError(`Invalid length (<) ${length}`);
        }
        this.length = length;

        let bytes = (length + 8) >> 3;
        let buffer = new ArrayBuffer(bytes);
        this.bits = new Int8Array(buffer);
    }

    get(idx: number): boolean {
        if (this.outOfRange(idx)) {
            throw new RangeError(`Invalid index ${idx}`);
        }
        return (this.bits[idx >> 3] & (1 << (idx & 7))) !== 0;
    }

    set(idx: number): void {
        if (this.outOfRange(idx)) {
            throw new RangeError(`Invalid index ${idx}`);
        }
        this.bits[idx >> 3] |= 1 << (idx & 7);
    }

    unset(idx: number): void {
        if (this.outOfRange(idx)) {
            throw new RangeError(`Invalid index ${idx}`);
        }
        this.bits[idx >> 3] &= ~(1 << (idx & 7));
    }

    // flip(idx: number): void {
    //     if (this.outOfRange(idx)) {
    //         throw new RangeError(`Invalid index ${idx}`);
    //     }
    //     this.bits[idx >> 3] ^= 1 << (idx & 7);
    // }

    toBooleanArray(): boolean[] {
        let result = new Array(this.length);
        for (let i = 0; i < this.length; ++i) {
            result[i] = this.get(i);
        }
        return result;
    }

    toNumberArray(): number[] {
        let result = new Array(this.byteLength);
        for (let i = 0; i < this.byteLength; ++i) {
            result[i] = this.bits[i];
        }
        return result;
    }

    toArrayBuffer(): ArrayBuffer {
        return this.bits.buffer;
    }

    private outOfRange(idx: number): boolean {
        return idx < 0 || idx >= this.length;
    }
}

