export type LumaVector = [number, number, number];
export type Converter = (img: ImageData) => ImageData;

export function grayscaleRgbPixel(r: number, g: number, b: number, [rw, gw, bw]: LumaVector) {
    return Math.min(Math.ceil(r * rw + g * gw + b * bw), 255);
}

function makeRgbaConverter(lumaVector: LumaVector): Converter {
    return (img: ImageData) => {
        let size = img.width * img.height;
        let data = new Uint8ClampedArray(size);

        for (let i = 0; i < size; ++i) {
            let startPos = i << 2;
            let r: number = img.data[startPos + 0];
            let g: number = img.data[startPos + 1];
            let b: number = img.data[startPos + 2];

            let pixel = grayscaleRgbPixel(r, g, b, lumaVector);
            data[i] = pixel;
        }

        return { width: img.width, height: img.height, data };
    };
}

export const LUMA_PS: LumaVector = [ 0.3, 0.59, 0.11 ];
export const LUMA_BT709: LumaVector = [ 0.2126, 0.7152, 0.0722 ];
export const LUMA_BT601: LumaVector = [ 0.299, 0.587, 0.114 ];

export const bt709Converter: Converter = makeRgbaConverter(LUMA_BT709);
export const bt601Converter: Converter = makeRgbaConverter(LUMA_BT601);
export const psLikeConverter: Converter = makeRgbaConverter(LUMA_PS);
