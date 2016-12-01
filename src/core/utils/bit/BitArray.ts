/**
 * Fast realisation of array of bits represents by javascript's typed arrays.
 *
 * @link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Typed_arrays
 */
export class BitArray {
    bits: Int8Array;

    constructor(public length: number = 1) {
        if (!Number.isInteger(length)) { // TODO add polyfill
            throw new RangeError(`Invalid length ${length}`);
        }
        if (length < 1) {
            throw new RangeError(`Invalid length ${length}`);
        }
        this.length = length;

        let bytes = (length + 8) >> 3;
        let buffer = new ArrayBuffer(bytes);
        this.bits = new Int8Array(buffer);
    }

    get byteLength(): number {
        return this.bits.byteLength;
    }

    /**
     * Gets bit value
     *
     * @param idx Bit to get
     * @returns {boolean} true if bit is set (equals 1), false if bit is unset (equals 0)
     */
    get(idx: number): boolean {
        if (this.outOfRange(idx)) {
            throw new RangeError(`Invalid index ${idx}`);
        }
        return (this.bits[idx >> 3] & (1 << (idx & 7))) !== 0;
    }

    /**
     * Sets given bit value to 1 (true)
     *
     * @param idx Bit to set
     */
    set(idx: number): void {
        if (this.outOfRange(idx)) {
            throw new RangeError(`Invalid index ${idx}`);
        }
        this.bits[idx >> 3] |= 1 << (idx & 7);
    }

    /**
     * Sets given bit value to 0
     *
     * @param idx Bit to unset
     */
    unset(idx: number): void {
        if (this.outOfRange(idx)) {
            throw new RangeError(`Invalid index ${idx}`);
        }
        this.bits[idx >> 3] &= ~(1 << (idx & 7));
    }

    /**
     * Reverses given bit value
     *
     * @param idx Bit to flip
     */
    flip(idx: number): void {
        if (this.outOfRange(idx)) {
            throw new RangeError(`Invalid index ${idx}`);
        }
        this.bits[idx >> 3] ^= 1 << (idx & 7);
    }

    /**
     * Converts to array of boolean
     *
     * @returns {boolean[]}
     */
    toBooleanArray(): boolean[] {
        let result = new Array(this.length);
        for (let i = 0; i < this.length; ++i) {
            result[i] = this.get(i);
        }
        return result;
    }

    /**
     * Converts to array of integer numbers
     *
     * @returns {number[]}
     */
    toNumberArray(): number[] {
        let result = new Array(this.byteLength);
        for (let i = 0; i < this.byteLength; ++i) {
            result[i] = this.bits[i];
        }
        return result;
    }

    private outOfRange(idx: number): boolean {
        return idx < 0 || idx >= this.length;
    }
}
