import { BitMatrix } from './bitmatrix';
export declare class Binarizer {
    static getMatrix(image: ImageData): BitMatrix;
    static calculateBlackPoints(lums: number[], subWidth: number, subHeight: number, width: number, height: number): number[][];
    static calculateThreshHold(lums: number[], subWidth: number, subHeight: number, width: number, height: number, blackPoints: number[][]): BitMatrix;
    static treshholdBlock(lums: number[], xoffset: number, yoffset: number, threshold: number, stride: number, matrix: BitMatrix): void;
    static cap(value: number, min: number, max: number): number;
}
