import { Converter, bt709Converter } from './converter';
import { CropData, crop } from './crop';

/**
 * GSImage represents grayscale image
 */
export class GSImage {
    static fromRgba(imageData: ImageData, converter: Converter = bt709Converter): GSImage {
        let res = converter.call(null, imageData);
        return new GSImage(res);
    }

    readonly width: number;
    readonly height: number;
    data: Uint8ClampedArray;

    constructor({ width, height, data }: ImageData) {
        this.width = width;
        this.height = height;
        this.data = data;
    }

    crop(cropData: CropData): GSImage {
        return new GSImage(crop(this, cropData));
    }

    getRow(y: number): Uint8ClampedArray {
        return new Uint8ClampedArray(this.data.buffer, y * this.width, this.width);
    }

    getMatrix(): Uint8ClampedArray {
        return this.data;
    }
}
