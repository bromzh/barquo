import { BitMatrix, BitArray } from 'barquo/core';

describe('BitMatrix', () => {
    // it('should create matrix with zero sizes by default', () => {
    //     let ba: IBitArray = new BitArray();
    //     expect(ba.length).toBe(0);
    //     expect(ba.byteLength).toBe(0);
    // });

    it('should create rectangle matrix if only one argument passed to constructor', () => {
        let bm: BitMatrix = new BitMatrix(5);
        expect(bm.width).toBe(bm.height);
    });

    // it('should return correct row size', () => {
    //     let bm: BitMatrix = new BitMatrix(32, 16);
    //     expect(bm.rowSize).toBe(1);
    //     expect(bm.byteLength).toBe((32 * 16) >> 5);
    // });

    // it('should throws error while length less than 0 or very big', () => {
    //     expect(() => new BitArray(-1)).toThrowError(RangeError);
    //     expect(() => new BitArray(-100)).toThrowError(RangeError);
    // });
    //
    it('should fill array with zero bytes', () => {
        let bm: BitMatrix = new BitMatrix(8);
        expect(bm.get(0, 0)).toBe(false);
        expect(bm.get(0, 7)).toBe(false);
    });

    it('should set bytes correctly', () => {
        let bm: BitMatrix = new BitMatrix(8);
        expect(bm.get(0, 0)).toBe(false);
        bm.set(0, 0);
        expect(bm.get(0, 0)).toBe(true);

        expect(bm.get(1, 2)).toBe(false);
        bm.set(1, 2);
        expect(bm.get(1, 2)).toBe(true);
        expect(bm.get(1, 4)).toBe(false);
        expect(bm.get(2, 5)).toBe(false);
    });

    it('should unset bytes correctly', () => {
        let bm: BitMatrix = new BitMatrix(8);

        expect(bm.get(0, 0)).toBe(false);
        bm.set(0, 0);
        expect(bm.get(0, 0)).toBe(true);
        bm.unset(0, 0);
        expect(bm.get(0, 0)).toBe(false);

        expect(bm.get(5, 2)).toBe(false);
        bm.set(5, 2);
        expect(bm.get(5, 2)).toBe(true);
        bm.unset(5, 2);
        expect(bm.get(5, 2)).toBe(false);
    });

    // it('should flip bytes correctly', () => {
    //     let bm: BitMatrix = new BitMatrix(8);
    //
    //     expect(bm.get(0, 1)).toBe(false);
    //     bm.flip(0, 1);
    //     expect(bm.get(0, 1)).toBe(true);
    //     // bm.flip(0, 1);
    //     // expect(bm.get(0, 1)).toBe(false);
    //
    //     // expect(bm.get(5, 4)).toBe(false);
    //     // bm.set(5, 4);
    //     // expect(bm.get(5, 4)).toBe(true);
    //     // bm.flip(5, 4);
    //     // expect(bm.get(5, 4)).toBe(false);
    // });

    // it('should throw error while try to run operations with incorrect index', () => {
    //     let ba: BitArray = new BitArray(8);
    //
    //     expect(() => ba.set(-1)).toThrowError(RangeError);
    //     expect(() => ba.get(-1)).toThrowError(RangeError);
    //     expect(() => ba.flip(-1)).toThrowError(RangeError);
    //     expect(() => ba.unset(-1)).toThrowError(RangeError);
    //
    //     expect(() => ba.set(8)).toThrowError(RangeError);
    //     expect(() => ba.get(8)).toThrowError(RangeError);
    //     expect(() => ba.flip(8)).toThrowError(RangeError);
    //     expect(() => ba.unset(8)).toThrowError(RangeError);
    //
    //     expect(() => ba.set(100)).toThrowError(RangeError);
    //     expect(() => ba.get(100)).toThrowError(RangeError);
    //     expect(() => ba.flip(100)).toThrowError(RangeError);
    //     expect(() => ba.unset(100)).toThrowError(RangeError);
    // });

    it('should converts to boolean array', () => {
        let bm: BitMatrix = new BitMatrix(2);

        let boolArray: boolean[][] = bm.toBooleanArray();
        expect(boolArray).toEqual([
            [false, false],
            [false, false],
        ]);

        bm.set(0, 1);
        bm.set(1, 0);

        boolArray = bm.toBooleanArray();
        expect(boolArray).toEqual([
            [false, true],
            [true, false],
        ]);
    });

    // it('should converts to number array', () => {
    //     let bm: BitMatrix = new BitMatrix(8);
    //
    //     let numArray: number[] = bm.toNumberArray();
    //     expect(numArray).toEqual([0, 0, 0, 0, 0, 0, 0, 0]);
    //
    //     bm.set(1, 1);
    //     bm.set(3, 0);
    //
    //     numArray = bm.toNumberArray();
    //     expect(numArray).toEqual([8, 2, 0, 0, 0, 0, 0, 0]);
    // });
});
