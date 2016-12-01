import { GSImage, GlobalHistBinarizer, HybridBinarizer, NotFoundError } from 'barquo/core';

function makeImage(width: number, height: number, data: number[]): ImageData {
    return { width, height, data: Uint8ClampedArray.from(data) };
}

describe('Binarizer', () => {
    const W = [ 255, 255, 255, 255 ];
    const R = [ 255, 0, 0, 255 ];
    const G = [ 0, 255, 0, 255 ];
    const B = [ 0, 0, 255, 255 ];
    const K = [ 0, 0, 0, 255 ];

    const WEIGHTS = {
        bt709: {
            w: 255,
            r: 55,
            g: 183,
            b: 19,
            k: 0,
        },
    };

    let whiteImg: ImageData;
    let blackImg: ImageData;
    let rgbImg: ImageData;

    let images: ImageData[];

    beforeAll(() => {
        whiteImg = makeImage(4, 4, [
            ...W, ...W, ...W, ...W,
            ...W, ...W, ...W, ...W,
            ...W, ...W, ...W, ...W,
            ...W, ...W, ...W, ...W,
        ]);

        blackImg = makeImage(4, 4, [
            ...K, ...K, ...K, ...K,
            ...K, ...K, ...K, ...K,
            ...K, ...K, ...K, ...K,
            ...K, ...K, ...K, ...K,
        ]);

        rgbImg = makeImage(6, 6, [
            ...W, ...W, ...W, ...W, ...W, ...W,
            ...W, ...K, ...K, ...W, ...K, ...W,
            ...W, ...K, ...K, ...K, ...K, ...K,
            ...W, ...K, ...K, ...K, ...K, ...K,
            ...W, ...K, ...K, ...K, ...K, ...K,
            ...W, ...K, ...K, ...K, ...K, ...K,
        ]);

        images = [ whiteImg, blackImg, rgbImg ];
    });

    describe('GlobalHistBinarizer', () => {
        it('should return only false-values for white image', () => {
            let gsiWhite = GSImage.fromRgba(whiteImg);

            let ghbWhite = new GlobalHistBinarizer(gsiWhite);

            expect(ghbWhite.getBlackRow(0).toBooleanArray()).toEqual([ false, false, false, false ]);
            expect(ghbWhite.getBlackRow(1).toBooleanArray()).toEqual([ false, false, false, false ]);
            expect(ghbWhite.getBlackRow(2).toBooleanArray()).toEqual([ false, false, false, false ]);
            expect(ghbWhite.getBlackRow(3).toBooleanArray()).toEqual([ false, false, false, false ]);
            expect(ghbWhite.getBlackMatrix().toBooleanArray())
                .toEqual([
                    [ false, false, false, false ],
                    [ false, false, false, false ],
                    [ false, false, false, false ],
                    [ false, false, false, false ],
                ]);
        });

        it('should throw "NotFoundError" for black image', () => {
            let gsiBlack = GSImage.fromRgba(blackImg);

            let ghbBlack = new GlobalHistBinarizer(gsiBlack);

            expect(() => ghbBlack.getBlackRow(0)).toThrowError(NotFoundError);
            expect(() => ghbBlack.getBlackMatrix()).toThrowError(NotFoundError);
        });

        it('should find and return black row and matrix for image', () => {
            let gsi = GSImage.fromRgba(rgbImg);

            let ghb = new GlobalHistBinarizer(gsi);

            // console.log(ghb.getBlackMatrix().toBooleanArray());
            // console.log(ghb.getBlackRow(0).toBooleanArray());
            // console.log(ghb.getBlackRow(1).toBooleanArray());
            // console.log(ghb.getBlackRow(2).toBooleanArray());
        });
    });

    describe('HybridBinarizer', () => {
        it('should sth', () => {
            let gsi = GSImage.fromRgba(rgbImg);
            let hb = new HybridBinarizer(gsi);
        });
    });
});
