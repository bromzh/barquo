import { BitArray } from 'barquo/core';

describe('BitArray', () => {
    it('should create array with zero length by default', () => {
        let ba: BitArray = new BitArray();
        expect(ba.length).toBe(1);
        expect(ba.byteLength).toBe(1);
    });

    it('should return correct length in bytes', () => {
        let ba: BitArray = new BitArray(5);
        expect(ba.length).toBe(5);
        expect(ba.byteLength).toBe(1);

        ba = new BitArray(32 * 4);
        expect(ba.length).toBe(128);
        expect(ba.byteLength).toBe(17);
    });

    it('should throws error while length less than 1 or not an integer', () => {
        expect(() => new BitArray(0)).toThrowError(RangeError);
        expect(() => new BitArray(-1)).toThrowError(RangeError);
        expect(() => new BitArray(-100)).toThrowError(RangeError);
        expect(() => new BitArray(1.2)).toThrowError(RangeError);
        expect(() => new BitArray(NaN)).toThrowError(RangeError);
    });

    it('should fill array with zero bytes', () => {
        let ba: BitArray = new BitArray(8);
        expect(ba.get(0)).toBe(false);
        expect(ba.get(7)).toBe(false);
    });

    it('should set bytes correctly', () => {
        let ba = new BitArray(100);
        for (let i = 0; i < 100; ++i) {
            expect(ba.get(i)).toBe(false);
            ba.set(i);
            expect(ba.get(i)).toBe(true);
        }
    });

    it('should unset bytes correctly', () => {
        let ba: BitArray = new BitArray(8);

        expect(ba.get(0)).toBe(false);
        ba.set(0);
        expect(ba.get(0)).toBe(true);
        ba.unset(0);
        expect(ba.get(0)).toBe(false);

        expect(ba.get(5)).toBe(false);
        ba.set(5);
        expect(ba.get(5)).toBe(true);
        ba.unset(5);
        expect(ba.get(5)).toBe(false);
    });

    it('should flip bytes correctly', () => {
        let ba: BitArray = new BitArray(8);

        expect(ba.get(0)).toBe(false);
        ba.flip(0);
        expect(ba.get(0)).toBe(true);
        ba.flip(0);
        expect(ba.get(0)).toBe(false);

        expect(ba.get(5)).toBe(false);
        ba.set(5);
        expect(ba.get(5)).toBe(true);
        ba.flip(5);
        expect(ba.get(5)).toBe(false);
    });

    it('should throw error while try to run operations with incorrect index', () => {
        let ba: BitArray = new BitArray(8);

        expect(() => ba.set(-1)).toThrowError(RangeError);
        expect(() => ba.get(-1)).toThrowError(RangeError);
        expect(() => ba.flip(-1)).toThrowError(RangeError);
        expect(() => ba.unset(-1)).toThrowError(RangeError);

        expect(() => ba.set(8)).toThrowError(RangeError);
        expect(() => ba.get(8)).toThrowError(RangeError);
        expect(() => ba.flip(8)).toThrowError(RangeError);
        expect(() => ba.unset(8)).toThrowError(RangeError);

        expect(() => ba.set(100)).toThrowError(RangeError);
        expect(() => ba.get(100)).toThrowError(RangeError);
        expect(() => ba.flip(100)).toThrowError(RangeError);
        expect(() => ba.unset(100)).toThrowError(RangeError);
    });

    it('should converts to boolean array', () => {
        let ba: BitArray = new BitArray(5);

        let boolArray: boolean[] = ba.toBooleanArray();
        expect(boolArray).toEqual([false, false, false, false, false]);

        ba.set(1);
        ba.set(3);

        boolArray = ba.toBooleanArray();
        expect(boolArray).toEqual([false, true, false, true, false]);
    });

    it('should converts to number array', () => {
        let ba: BitArray = new BitArray(5);

        let numArray: number[] = ba.toNumberArray();
        expect(numArray).toEqual([0]);

        ba.set(1);
        ba.set(3);

        numArray = ba.toNumberArray();
        expect(numArray).toEqual([10]);
    });
});
