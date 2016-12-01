export interface CropData {
    left: number;
    top: number;
    width: number;
    height: number;
}

export function crop(img: ImageData, cropData: CropData): ImageData {
    let size = cropData.width * cropData.height;
    let data = new Uint8ClampedArray(size);

    let inputOffset = cropData.top * img.width + cropData.left;

    for (let i = 0; i < cropData.height; ++i) {
        let outputOffset = i * cropData.width;
        for (let j = 0; j < cropData.width; j++) {
            data[outputOffset + j] = img.data[inputOffset + j];
        }
        inputOffset += img.width;
    }

    return { width: cropData.width, height: cropData.height, data };
}
