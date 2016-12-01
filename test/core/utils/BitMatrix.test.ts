import { BitArray, BitMatrix } from 'barquo/core';

describe('BitMatrix', () => {
    it('should create rectangle matrix if only one argument passed to constructor', () => {
        let bm: BitMatrix = new BitMatrix(5);
        expect(bm.width).toBe(bm.height);
    });

    // xit('should throws error while length less than 0 or very big', () => {
    //     expect(() => new BitMatrix(-1)).toThrowError(RangeError);
    //     expect(() => new BitMatrix(-100)).toThrowError(RangeError);
    // });

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

    it('should flip bytes correctly', () => {
        let bm: BitMatrix = new BitMatrix(8);

        expect(bm.get(0, 1)).toBe(false);
        bm.flip(0, 1);
        expect(bm.get(0, 1)).toBe(true);
        bm.flip(0, 1);
        expect(bm.get(0, 1)).toBe(false);

        expect(bm.get(5, 4)).toBe(false);
        bm.set(5, 4);
        expect(bm.get(5, 4)).toBe(true);
        bm.flip(5, 4);
        expect(bm.get(5, 4)).toBe(false);
    });

    it('should throw error while try to run operations with incorrect index', () => {
        let bm: BitMatrix = new BitMatrix(8);

        expect(() => bm.set(-1, -1)).toThrowError(RangeError);
        expect(() => bm.get(-1, -1)).toThrowError(RangeError);
        expect(() => bm.flip(-1, -1)).toThrowError(RangeError);
        expect(() => bm.unset(-1, -1)).toThrowError(RangeError);

        expect(() => bm.set(8, 8)).toThrowError(RangeError);
        expect(() => bm.get(8, 8)).toThrowError(RangeError);
        expect(() => bm.flip(8, 8)).toThrowError(RangeError);
        expect(() => bm.unset(8, 8)).toThrowError(RangeError);

        expect(() => bm.set(100, 100)).toThrowError(RangeError);
        expect(() => bm.get(100, 100)).toThrowError(RangeError);
        expect(() => bm.flip(100, 100)).toThrowError(RangeError);
        expect(() => bm.unset(100, 100)).toThrowError(RangeError);
    });

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

    it('should converts to number array', () => {
        let bm: BitMatrix = new BitMatrix(8);

        let numArray: number[] = bm.toNumberArray();
        expect(numArray).toEqual([0, 0, 0, 0, 0, 0, 0, 0, 0]);

        bm.set(1, 1);
        bm.set(3, 0);

        numArray = bm.toNumberArray();
        expect(numArray).toEqual([8, 2, 0, 0, 0, 0, 0, 0, 0]);
    });

    it('should transpose matrix relates to main diagonal (mirror)', () => {
        let bm: BitMatrix = new BitMatrix(3);

        let boolArray: boolean[][] = bm.toBooleanArray();
        expect(boolArray).toEqual([
            [false, false, false],
            [false, false, false],
            [false, false, false],
        ]);

        bm.set(1, 0);
        bm.set(2, 0);
        bm.set(2, 1);

        let boolArrayOrig = bm.toBooleanArray();
        expect(boolArrayOrig).toEqual([
            [false, true, true],
            [false, false, true],
            [false, false, false],
        ]);

        bm.mirror();
        let boolArrayMirrored = bm.toBooleanArray();
        expect(boolArrayMirrored).toEqual([
            [false, false, false],
            [true, false, false],
            [true, true, false],
        ]);

        bm.mirror();
        expect(bm.toBooleanArray()).toEqual(boolArrayOrig);
    });
});
