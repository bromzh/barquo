import { BitArray, BitMatrix, GSImage, NotFoundError } from 'barquo/core';
import { Binarizer } from './Binarizer';

const LUMINANCE_BITS: number = 5;
const LUMINANCE_SHIFT: number = 8 - LUMINANCE_BITS;
const LUMINANCE_BUCKETS: number = 1 << LUMINANCE_BITS;

export class GlobalHistBinarizer implements Binarizer {
    readonly source: GSImage;

    constructor(source: GSImage) {
        this.source = source;
    }

    getBlackRow(y: number): BitArray {
        let width: number = this.source.width;
        let localLuminances: Uint8ClampedArray = this.source.getRow(y);
        let localBuckets: Uint16Array = new Uint16Array(LUMINANCE_BUCKETS);
        let row: BitArray = new BitArray(width);
        for (let x = 0; x < width; x++) {
            localBuckets[localLuminances[x] >> LUMINANCE_SHIFT]++;
        }

        let blackPoint: number = this.estimateBlackPoint(localBuckets);
        // console.log('black point', blackPoint);

        if (width < 3) {
            // Special case for very small images
            for (let x = 0; x < width; x++) {
                if ((localLuminances[x] & 0xff) < blackPoint) {
                    row.set(x);
                }
            }
        } else {
            let left: number = localLuminances[0];
            let center: number = localLuminances[1];
            for (let x = 1; x < width - 1; x++) {
                let right: number = localLuminances[x + 1];
                // A simple -1 4 -1 box filter with a weight of 2.
                let v = ((center << 2) - left - right) >> 1;
                // console.log('x', x, 'v', v);
                if (v < blackPoint) {
                    row.set(x);
                }
                left = center;
                center = right;
            }
        }
        return row;
    }

    getBlackMatrix(): BitMatrix {
        let width = this.source.width;
        let height = this.source.height;

        let localBuckets = new Uint16Array(LUMINANCE_BUCKETS);

        let matrix = new BitMatrix(width, height);

        for (let y = 1; y < 5; y++) {
            let row = Math.floor(height * y / 5);
            let localLuminances = this.source.getRow(row);
            let right = Math.ceil((width << 2) / 5);
            for (let x = Math.floor(width / 5); x < right; x++) {
                localBuckets[localLuminances[x] >> LUMINANCE_SHIFT]++;
            }
        }
        let blackPoint = this.estimateBlackPoint(localBuckets);

        let localLuminances = this.source.getMatrix();
        for (let y = 0; y < height; y++) {
            let offset = y * width;
            for (let x = 0; x < width; x++) {
                let pixel = localLuminances[offset + x];
                if (pixel < blackPoint) {
                    matrix.set(x, y);
                }
            }
        }

        return matrix;
    }

    private estimateBlackPoint(buckets: Uint16Array): number {
        // Find the tallest peak in the histogram.
        let numBuckets: number = buckets.length;
        let maxBucketCount = 0;
        let firstPeak = 0;
        let firstPeakSize = 0;
        for (let x = 0; x < numBuckets; x++) {
            if (buckets[x] > firstPeakSize) {
                firstPeak = x;
                firstPeakSize = buckets[x];
            }
            if (buckets[x] > maxBucketCount) {
                maxBucketCount = buckets[x];
            }
        }

        // Find the second-tallest peak which is somewhat far from the tallest peak.
        let secondPeak = 0;
        let secondPeakScore = 0;
        for (let x = 0; x < numBuckets; x++) {
            let distanceToBiggest = x - firstPeak;
            // Encourage more distant second peaks by multiplying by square of distance.
            let score = buckets[x] * distanceToBiggest * distanceToBiggest;
            if (score > secondPeakScore) {
                secondPeak = x;
                secondPeakScore = score;
            }
        }

        // Make sure firstPeak corresponds to the black peak.
        if (firstPeak > secondPeak) {
            let temp = firstPeak;
            firstPeak = secondPeak;
            secondPeak = temp;
        }

        // If there is too little contrast in the image to pick a meaningful black point, throw rather
        // than waste time trying to decode the image, and risk false positives.
        let peaksDistance = secondPeak - firstPeak;
        if (peaksDistance <= numBuckets / LUMINANCE_BUCKETS) {
            throw new NotFoundError();
        }

        // Find a valley between them that is low and closer to the white peak.
        let bestValley = Math.max(0, secondPeak - 1);
        let bestValleyScore = -1;
        for (let x = secondPeak - 1; x > firstPeak; x--) {
            let fromFirst = x - firstPeak;
            let score = fromFirst * fromFirst * (secondPeak - x) * (maxBucketCount - buckets[x]);
            if (score > bestValleyScore) {
                bestValley = x;
                bestValleyScore = score;
            }
        }
        return (bestValley << LUMINANCE_SHIFT) & 0xff;
    }
}
