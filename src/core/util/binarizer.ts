import { BitMatrix } from './bitmatrix';
import { BitArray } from './bitarray';

const BLOCK_SIZE_POWER = 3;
const BLOCK_SIZE = 1 << BLOCK_SIZE_POWER;
const BLOCK_SIZE_MASK = BLOCK_SIZE - 1;
const MIN_DYNAMIC_RANGE = 24;

const LUMINANCE_BITS = 5;
const LUMINANCE_SHIFT = 8 - LUMINANCE_BITS;
const LUMINANCE_BUCKETS = 1 << LUMINANCE_BITS;
const EMPTY = [0];

export class Binarizer {
    static getMatrix(image: ImageData): BitMatrix {
        let lums: number[] = new Array(image.width * image.height);
        for (let x = 0; x < image.width; x++) {
            for (let y = 0; y < image.height; y++) {
                let startIndex = (y * image.width + x) * 4;
                let r = image.data[startIndex];
                let g = image.data[startIndex + 1];
                let b = image.data[startIndex + 2];
                // Magic lumosity constants
                let lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
                lums[y * image.width + x] = lum;
            }
        }
        let subWidth = image.width >> BLOCK_SIZE_POWER;
        if ((image.width & BLOCK_SIZE_MASK) !== 0) {
            subWidth++;
        }
        let subHeight = image.height >> BLOCK_SIZE_POWER;
        if ((image.height & BLOCK_SIZE_MASK) !== 0) {
            subHeight++;
        }
        let blackPoints: number[][] = this.calculateBlackPoints(lums, subWidth, subHeight,
            image.width, image.height);

        let result = this.calculateThreshHold(lums, subWidth, subHeight,
            image.width, image.height, blackPoints);
        return result;
    }

    // static getRow(y: number, row: BitArray) {
    //     return null;
    // }

    static calculateBlackPoints(lums: number[], subWidth: number, subHeight: number,
        width: number, height: number): number[][] {
        let blackPoints = new Array(subHeight);
        for (let i = 0; i < subHeight; ++i) {
            blackPoints[i] = new Array(subWidth);
        }
        for (let y = 0; y < subHeight; y++) {
            let yoffset: number = y << BLOCK_SIZE_POWER;
            let maxYOffset: number = height - BLOCK_SIZE;
            if (yoffset > maxYOffset) {
                yoffset = maxYOffset;
            }
            for (let x = 0; x < subWidth; x++) {
                let xoffset: number = x << BLOCK_SIZE_POWER;
                let maxXOffset: number = width - BLOCK_SIZE;
                if (xoffset > maxXOffset) {
                    xoffset = maxXOffset;
                }
                let sum = 0;
                let min = 0xFF;
                let max = 0;
                for (let yy = 0, offset = yoffset * width + xoffset; yy < BLOCK_SIZE; yy++, offset += width) {
                    for (let xx = 0; xx < BLOCK_SIZE; xx++) {
                        let pixel = lums[offset + xx] & 0xFF;
                        sum += pixel;
                        // still looking for good contrast
                        if (pixel < min) {
                            min = pixel;
                        }
                        if (pixel > max) {
                            max = pixel;
                        }
                    }
                    // short-circuit min/max tests once dynamic range is met
                    if (max - min > MIN_DYNAMIC_RANGE) {
                        // finish the rest of the rows quickly
                        for (yy++, offset += width; yy < BLOCK_SIZE; yy++, offset += width) {
                            for (let xx = 0; xx < BLOCK_SIZE; xx++) {
                                sum += lums[offset + xx] & 0xFF;
                            }
                        }
                    }
                }

                // The default estimate is the average of the values in the block.
                let average = sum >> (BLOCK_SIZE_POWER * 2);
                if (max - min <= MIN_DYNAMIC_RANGE) {
                    // If variation within the block is low, assume this is a block with only light or only
                    // dark pixels. In that case we do not want to use the average, as it would divide this
                    // low contrast area into black and white pixels, essentially creating data out of noise.
                    //
                    // The default assumption is that the block is light/background. Since no estimate for
                    // the level of dark pixels exists locally, use half the min for the block.
                    average = min >> 1;

                    if (y > 0 && x > 0) {
                        // Correct the "white background" assumption for blocks that have neighbors by comparing
                        // the pixels in this block to the previously calculated black points. This is based on
                        // the fact that dark barcode symbology is always surrounded by some amount of light
                        // background for which reasonable black point estimates were made. The bp estimated at
                        // the boundaries is used for the interior.

                        // The (min < bp) is arbitrary but works better than other heuristics that were tried.
                        let averageNeighborBlackPoint =
                            (blackPoints[y - 1][x] + (2 * blackPoints[y][x - 1]) + blackPoints[y - 1][x - 1]) >> 2;
                        if (min < averageNeighborBlackPoint) {
                            average = averageNeighborBlackPoint;
                        }
                    }
                }
                blackPoints[y][x] = average;
            }
        }
        return blackPoints;
    }

    static calculateThreshHold(lums: number[], subWidth: number, subHeight: number,
        width: number, height: number, blackPoints: number[][]) {
        let matrix = new BitMatrix(width, height);
        for (let y = 0; y < subHeight; y++) {
            let yoffset = y << BLOCK_SIZE_POWER;
            let maxYOffset = height - BLOCK_SIZE;
            if (yoffset > maxYOffset) {
                yoffset = maxYOffset;
            }
            for (let x = 0; x < subWidth; x++) {
                let xoffset = x << BLOCK_SIZE_POWER;
                let maxXOffset = width - BLOCK_SIZE;
                if (xoffset > maxXOffset) {
                    xoffset = maxXOffset;
                }
                let left = this.cap(x, 2, subWidth - 3);
                let top = this.cap(y, 2, subHeight - 3);
                let sum = 0;
                for (let z = -2; z <= 2; z++) {
                    let blackRow = blackPoints[top + z];
                    sum += blackRow[left - 2] + blackRow[left - 1] + blackRow[left]
                        + blackRow[left + 1] + blackRow[left + 2];
                }
                let average = ~~(sum / 25);
                this.treshholdBlock(lums, xoffset, yoffset, average, width, matrix);
            }
        }
        return matrix;
    }

    static treshholdBlock(lums: number[], xoffset: number, yoffset: number, threshold: number, stride: number,
        matrix: BitMatrix) {
        for (let y = 0, offset = yoffset * stride + xoffset; y < BLOCK_SIZE; y++, offset += stride) {
            for (let x = 0; x < BLOCK_SIZE; x++) {
                let pixel = lums[offset + x] & 0xff;
                if (pixel <= threshold) {
                    matrix.set(xoffset + x, yoffset + y);
                }
                // Comparison needs to be <= so that black == 0 pixels are black even if the threshold is 0.
                // matrix.set(xoffset + x, yoffset + y, pixel <= threshold);
            }
        }
    }

    static cap(value: number, min: number, max: number): number {
        return value < min ? min : value > max ? max : value;
    }
}
