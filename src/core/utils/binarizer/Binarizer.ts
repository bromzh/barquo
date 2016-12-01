import { BitArray, BitMatrix, GSImage  } from 'barquo/core';

export interface Binarizer {
    readonly source: GSImage;

    getBlackRow(y: number): BitArray;
    getBlackMatrix(): BitMatrix;
}
