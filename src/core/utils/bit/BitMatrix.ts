import { BitArray } from './BitArray';

/**
 * Fast realisation of two-dimension array of bits represents by javascript's typed arrays.
 *
 * @link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Typed_arrays
 */
export class BitMatrix {
    width: number;
    height: number;

    data: BitArray;

    constructor(width: number, height?: number) {
        this.width = width;
        this.height = height || width;
        this.data = new BitArray(this.width * this.height);
    }

    /**
     * Gets given bit value
     *
     * @param x The horizontal component (i.e. which column)
     * @param y The vertical component (i.e. which row)
     * @returns {boolean} true if bit is set (equals 1), false if bit is unset (equals 0)
     */
    get(x: number, y: number): boolean {
        return this.data.get(y * this.width + x);
    }

    /**
     * Sets given bit value to 1 (true)
     *
     * @param x The horizontal component (i.e. which column)
     * @param y The vertical component (i.e. which row)
     */
    set(x: number, y: number): void {
        this.data.set(y * this.width + x);
    }

    /**
     * Sets given bit value to 0 (false)
     *
     * @param x The horizontal component (i.e. which column)
     * @param y The vertical component (i.e. which row)
     */
    unset(x: number, y: number): void {
        this.data.unset(y * this.width + x);
    }

    /**
     * Reverses given bit value
     *
     * @param x The horizontal component (i.e. which column)
     * @param y The vertical component (i.e. which row)
     */
    flip(x: number, y: number): void {
        this.data.flip(y * this.width + x);
    }

    /**
     * Sets rectangle region of the matrix to true
     *
     * @param left The horizontal position to begin at (inclusive)
     * @param top The vertical position to begin at (inclusive)
     * @param width The width of the region
     * @param height The height of the region
     */
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

    /**
     * Transpose matrix
     */
    mirror() {
        for (let x = 0; x < this.width; x++) {
            for (let y = x + 1; y < this.height; y++) {
                if (this.get(x, y) !== this.get(y, x)) {
                    this.flip(x, y);
                    this.flip(y, x);
                    // this.get(x, y) ? this.unset(x, y) : this.set(x, y);
                    // this.get(y, x) ? this.unset(y, x) : this.set(y, x);
                }
            }
        }
    }

    toBooleanArray(): boolean[][] {
        let result = new Array(this.height);
        for (let i = 0; i < this.height; ++i) {
            result[i] = new Array(this.width);
            for (let j = 0; j < this.width; ++j) {
                result[i][j] = this.get(j, i);
            }
        }
        return result;
    }

    toNumberArray(): number[] {
        return this.data.toNumberArray();
    }
}
