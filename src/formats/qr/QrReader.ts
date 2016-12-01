import { Reader, Result, GSImage, HybridBinarizer, Binarizer } from 'barquo/core';

export class QrReader implements Reader {
    gsImage: GSImage;
    binarizer: Binarizer;

    decode(image: ImageData): Result {
        return null;
    }
}
