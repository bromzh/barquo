import { BitArray } from './bitarray';

export interface IBitMatrix {
    readonly width: number;
    readonly height: number;
    // readonly rowSize: number;
    // readonly byteLength: number;

    get(x: number, y: number): boolean;
    set(x: number, y: number): void;
    unset(x: number, y: number): void;
    // flip(x: number, y: number): void;
    setRegion(left: number, top: number, width: number, height: number): void;

    toBooleanArray(): boolean[][];
    toNumberArray(): number[];
    // toArrayBuffer(): ArrayBuffer;
}

export class BitMatrix implements IBitMatrix {
    width: number;
    height: number;
    // rowSize: number;

    data: BitArray;

    constructor(width: number, height?: number) {
        this.width = width;
        this.height = height || width;
        this.data = new BitArray(this.width * this.height);
    }

    get(x: number, y: number): boolean {
        return this.data.get(y * this.width + x);
        // let offset = y * this.rowSize + (x >> 5);
        // return ((this.bits[offset] >>> x) & 1) !== 0;
    }

    set(x: number, y: number): void {
        this.data.set(y * this.width + x);
        // let offset = y * this.rowSize + (x >> 5);
        // this.bits[offset] |= (1 << x);
    }

    unset(x: number, y: number): void {
        this.data.unset(y * this.width + x);
        // let offset = y * this.rowSize + (x >> 5);
        // this.bits[offset] &= ~(1 << x);
    }

    // flip(x: number, y: number): void {
    //     this.data.unset(y * this.width + x);
        // let offset = y * this.rowSize + (x >> 5);
        // this.bits[offset] ^= 1 << x;
    // }

    setRegion(left: number, top: number, width: number, height: number) {
        let right = left + width;
        let bottom = top + height;
        for (let y = top; y < bottom; y++) {
            for (let x = left; x < right; x++) {
                this.set(x, y);
            }
        }
    }

    copyBit(x: number, y: number, versionBits: number): number {
        return this.get(x, y) ? (versionBits << 1) | 0x1 : versionBits << 1;
    }

    mirror() {
        for (let x = 0; x < this.width; x++) {
            for (let y = x + 1; y < this.height; y++) {
                if (this.get(x, y) !== this.get(y, x)) {
                    this.get(x, y) ? this.unset(x, y) : this.set(x, y);
                    this.get(y, x) ? this.unset(y, x) : this.set(y, x);
                    // this.set(x, y, !this.get(x, y));
                    // this.set(y, x, !this.get(y, x));
                }
            }
        }
    }

    toBooleanArray(): boolean[][] {
        let result = new Array(this.height);
        for (let i = 0; i < this.height; ++i) {
            result[i] = new Array(this.width);
            for (let j = 0; j < this.width; ++j) {
                result[i][j] = this.get(i, j);
            }
        }
        return result;
    }

    toNumberArray(): number[] {
        return this.data.toNumberArray();
    }

    // toArrayBuffer(): ArrayBuffer {
    //     return null;
    // }
}

// export class BitMatrix implements IBitMatrix {
//     // width: number;
//     // height: number;
//     data: boolean[];
//
//     static createEmpty(width: number, height: number) {
//         let data: boolean[] = new Array(width * height);
//         for (let i = 0; i < data.length; i++) {
//             data[i] = false;
//         }
//         return data;
//         // return new BitMatrix(data, width);
//     }
//
//     constructor(public width: number, public height: number) {
//         this.data = BitMatrix.createEmpty(width, height);
//     }
//
//     get(x: number, y: number): boolean {
//         return this.data[y * this.width + x];
//     }
//
//     set(x: number, y: number, v: boolean = true) {
//         this.data[y * this.width + x] = v;
//     }
//
//     unset(x: number, y: number) {
//         this.set(x, y, false);
//     }
//
//     flip(x: number, y: number) {
//         this.set(x, y, !this.get(x, y));
//     }
//
//     // copyBit(x: number, y: number, versionBits: number): number {
//     //     return this.get(x, y) ? (versionBits << 1) | 0x1 : versionBits << 1;
//     // }
//     //
//     // setRegion(left: number, top: number, width: number, height: number) {
//     //     let right = left + width;
//     //     let bottom = top + height;
//     //     for (let y = top; y < bottom; y++) {
//     //         for (let x = left; x < right; x++) {
//     //             this.set(x, y, true);
//     //         }
//     //     }
//     // }
//     //
//     // mirror() {
//     //     for (let x = 0; x < this.width; x++) {
//     //         for (let y = x + 1; y < this.height; y++) {
//     //             if (this.get(x, y) !== this.get(y, x)) {
//     //                 this.set(x, y, !this.get(x, y));
//     //                 this.set(y, x, !this.get(y, x));
//     //             }
//     //         }
//     //     }
//     // }
// }
