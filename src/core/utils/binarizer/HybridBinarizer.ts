import { BitMatrix, GSImage } from 'barquo/core';
import { GlobalHistBinarizer } from './GlobalHistBinarizer';

const BLOCK_SIZE_POWER: number = 3;
const BLOCK_SIZE: number = 1 << BLOCK_SIZE_POWER; // ...0100...00
const BLOCK_SIZE_MASK: number = BLOCK_SIZE - 1;   // ...0011...11
const MINIMUM_DIMENSION: number = BLOCK_SIZE * 5;
const MIN_DYNAMIC_RANGE: number = 24;

export class HybridBinarizer extends GlobalHistBinarizer {
    constructor(source: GSImage) {
        super(source);
    }

    getBlackMatrix(): BitMatrix {
        let width = this.source.width;
        let height = this.source.height;

        if (width >= MINIMUM_DIMENSION && height >= MINIMUM_DIMENSION) {
            let subWidth = width >> BLOCK_SIZE_POWER;
            if ((width & BLOCK_SIZE_MASK) !== 0) {
                subWidth++;
            }
            let subHeight = height >> BLOCK_SIZE_POWER;
            if ((height & BLOCK_SIZE_MASK) !== 0) {
                subHeight++;
            }
            let blackPoints = this.getBlackPoints(this.source, subWidth, subHeight);

            return this.getThresholdForBlock(this.source, subWidth, subHeight, blackPoints);
        } else {
            // If the image is too small, fall back to the global histogram approach.
            return super.getBlackMatrix();
        }
    }

    private getBlackPoints(gsImg: GSImage, sw: number, sh: number): number[][] {
        let blackPoints: number[][] = new Array(sh);
        for (let i = 0; i < sh; ++i) {
            blackPoints[i] = new Array(sw);
        }
        for (let y = 0; y < sh; y++) {
            let yoffset = y << BLOCK_SIZE_POWER;
            let maxYOffset = gsImg.height - BLOCK_SIZE;
            if (yoffset > maxYOffset) {
                yoffset = maxYOffset;
            }
            for (let x = 0; x < sw; x++) {
                let xoffset = x << BLOCK_SIZE_POWER;
                let maxXOffset = gsImg.width - BLOCK_SIZE;
                if (xoffset > maxXOffset) {
                    xoffset = maxXOffset;
                }
                let sum = 0;
                let min = 0xFF;
                let max = 0;
                for (let yy = 0, offset = yoffset * gsImg.width + xoffset;
                    yy < BLOCK_SIZE;
                    yy++, offset += gsImg.width) {
                    for (let xx = 0; xx < BLOCK_SIZE; xx++) {
                        let pixel = gsImg.getMatrix()[offset + xx] & 0xFF;
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
                        for (yy++ , offset += gsImg.width; yy < BLOCK_SIZE; yy++ , offset += gsImg.width) {
                            for (let xx = 0; xx < BLOCK_SIZE; xx++) {
                                sum += gsImg.getMatrix()[offset + xx] & 0xFF;
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
                            (blackPoints[y - 1][x] + (2 * blackPoints[y][x - 1]) + blackPoints[y - 1][x - 1]) / 4;
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

    private getThresholdForBlock(gsImg: GSImage, sw: number, sh: number, blackPoints: number[][]): BitMatrix {
        // let luminances: Uint8ClampedArray = gsImg.getMatrix();
        // let width = gsImg.width;
        // let height = gsImg.height;
        for (let y = 0; y < sh; y++) {
            let yoffset = y << BLOCK_SIZE_POWER;
            let maxYOffset = gsImg.height - BLOCK_SIZE;
            if (yoffset > maxYOffset) {
                yoffset = maxYOffset;
            }
            for (let x = 0; x < sw; x++) {
                let xoffset = x << BLOCK_SIZE_POWER;
                let maxXOffset = gsImg.width - BLOCK_SIZE;
                if (xoffset > maxXOffset) {
                    xoffset = maxXOffset;
                }
                let left = this.cap(x, 2, sw - 3);
                let top = this.cap(y, 2, sh - 3);
                let sum = 0;
                for (let z = -2; z <= 2; z++) {
                    let blackRow: number[] = blackPoints[top + z];
                    sum += blackRow[left - 2] + blackRow[left - 1] + blackRow[left]
                        + blackRow[left + 1] + blackRow[left + 2];
                }
                let average = Math.floor(sum / 25);
                this.thresholdBlock(gsImg, xoffset, yoffset, average, gsImg.width);
            }
        }
        return null;
    }

    private thresholdBlock(gsImg: GSImage, xoffset: number, yoffset: number,
        threshold: number, stride: number): BitMatrix {
        let matrix = new BitMatrix(gsImg.width, gsImg.height);
        for (let y = 0, offset = yoffset * stride + xoffset; y < BLOCK_SIZE; y++, offset += stride) {
            for (let x = 0; x < BLOCK_SIZE; x++) {
                if ((gsImg.getMatrix()[offset + x] & 0xFF) <= threshold) {
                    matrix.set(xoffset + x, yoffset + y);
                }
            }
        }
        return matrix;
    }

    private cap(value: number, min: number, max: number) {
        return value < min ? min : value > max ? max : value;
    }
}
