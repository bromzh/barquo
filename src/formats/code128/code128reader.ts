import { Reader, Result, BitArray } from 'barquo/core';

export class Code128Reader implements Reader {
    decode(image: ImageData): Result {
        return null;
    }

    private doDecode(image: ImageData): Result {
        let width: number = image.width;
        let height: number = image.height;

        let row: BitArray = new BitArray(width);
        let middle = height >> 1;
        let rowStep = Math.max(1, height >> 8);
        let maxLines = height;

        for (let x = 0; x < maxLines; ++x) {
            let rowStepsAboveOrBelow = (x + 1) >> 1;
            let isAbove = (x && 1) === 0;
            let rowNumber = middle + rowStep * (isAbove ? rowStepsAboveOrBelow : -rowStepsAboveOrBelow);
            if (rowNumber < 0 || rowNumber >= height) {
                break;
            }
        }
        // getBlackRow(image, rowNumber);
        return null;
    }
}