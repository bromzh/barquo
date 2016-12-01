import { GSImage, bt709Converter, CropData } from 'barquo/core';

function makeImage(width: number, height: number, data: number[]): ImageData {
    return { width, height, data: Uint8ClampedArray.from(data) };
}

describe('GSImage', () => {
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
        whiteImg = makeImage(2, 2, [
            ...W, ...W,
            ...W, ...W,
        ]);

        blackImg = makeImage(2, 2, [
            ...K, ...K,
            ...K, ...K,
        ]);

        rgbImg = makeImage(3, 3, [
            ...R, ...G, ...B,
            ...B, ...R, ...G,
            ...G, ...B, ...R,
        ]);

        images = [ whiteImg, blackImg, rgbImg ];
    });

    it('should convert to grayscale image correct', () => {
        images.forEach(img => {
            let gsi = GSImage.fromRgba(img);
            let size = img.width * img.height;

            expect(gsi.data.byteLength).toBe(img.width * img.height);

            for (let i = 0; i < size; ++i) {
                expect(gsi.data[i]).toBeGreaterThanOrEqual(0);
                expect(gsi.data[i]).toBeLessThanOrEqual(255);
            }
        });
    });

    it('should crop', () => {
        function testCrop(sourceImg: ImageData, cropData: CropData, expected: number[]): boolean {
            let gsi = GSImage.fromRgba(sourceImg, bt709Converter);
            let gsData = gsi.data;
            return expect(gsi.crop(cropData).data).toEqual(Uint8ClampedArray.from(expected));
        }

        testCrop(rgbImg, { top: 0, left: 0, width: 1, height: 1 }, [ WEIGHTS.bt709.r ]);
        testCrop(rgbImg, { top: 0, left: 1, width: 1, height: 1 }, [ WEIGHTS.bt709.g ]);
        testCrop(rgbImg, { top: 0, left: 2, width: 1, height: 1 }, [ WEIGHTS.bt709.b ]);

        testCrop(rgbImg, { top: 1, left: 0, width: 1, height: 1 }, [ WEIGHTS.bt709.b ]);
        testCrop(rgbImg, { top: 1, left: 1, width: 1, height: 1 }, [ WEIGHTS.bt709.r ]);
        testCrop(rgbImg, { top: 1, left: 2, width: 1, height: 1 }, [ WEIGHTS.bt709.g ]);

        testCrop(rgbImg, { top: 2, left: 0, width: 1, height: 1 }, [ WEIGHTS.bt709.g ]);
        testCrop(rgbImg, { top: 2, left: 1, width: 1, height: 1 }, [ WEIGHTS.bt709.b ]);
        testCrop(rgbImg, { top: 2, left: 2, width: 1, height: 1 }, [ WEIGHTS.bt709.r ]);

        testCrop(whiteImg, { top: 0, left: 0, width: 1, height: 1}, [ WEIGHTS.bt709.w ]);
        testCrop(blackImg, { top: 0, left: 0, width: 1, height: 1}, [ WEIGHTS.bt709.k ]);

        testCrop(rgbImg, { top: 1, left: 2, width: 1, height: 2 }, [ WEIGHTS.bt709.g, WEIGHTS.bt709.r ]);
        testCrop(rgbImg, { top: 2, left: 1, width: 2, height: 1 }, [ WEIGHTS.bt709.b, WEIGHTS.bt709.r ]);
    });

    it('should take a row', () => {
        let img = rgbImg;
        let gsi = GSImage.fromRgba(img, bt709Converter);

        for (let i = 0; i < img.height; ++i) {
            expect(gsi.crop({ top: i, left: 0, width: img.width, height: 1 }).data).toEqual(gsi.getRow(i));
        }
    });
});
