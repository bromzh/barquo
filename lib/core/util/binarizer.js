import { BitMatrix } from './bitmatrix';
var BLOCK_SIZE_POWER = 3;
var BLOCK_SIZE = 1 << BLOCK_SIZE_POWER;
var BLOCK_SIZE_MASK = BLOCK_SIZE - 1;
var MIN_DYNAMIC_RANGE = 24;
var LUMINANCE_BITS = 5;
var LUMINANCE_SHIFT = 8 - LUMINANCE_BITS;
var LUMINANCE_BUCKETS = 1 << LUMINANCE_BITS;
var EMPTY = [0];
export var Binarizer = (function () {
    function Binarizer() {
    }
    Binarizer.getMatrix = function (image) {
        var lums = new Array(image.width * image.height);
        for (var x = 0; x < image.width; x++) {
            for (var y = 0; y < image.height; y++) {
                var startIndex = (y * image.width + x) * 4;
                var r = image.data[startIndex];
                var g = image.data[startIndex + 1];
                var b = image.data[startIndex + 2];
                // Magic lumosity constants
                var lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
                lums[y * image.width + x] = lum;
            }
        }
        var subWidth = image.width >> BLOCK_SIZE_POWER;
        if ((image.width & BLOCK_SIZE_MASK) !== 0) {
            subWidth++;
        }
        var subHeight = image.height >> BLOCK_SIZE_POWER;
        if ((image.height & BLOCK_SIZE_MASK) !== 0) {
            subHeight++;
        }
        var blackPoints = this.calculateBlackPoints(lums, subWidth, subHeight, image.width, image.height);
        var result = this.calculateThreshHold(lums, subWidth, subHeight, image.width, image.height, blackPoints);
        return result;
    };
    // static getRow(y: number, row: BitArray) {
    //     return null;
    // }
    Binarizer.calculateBlackPoints = function (lums, subWidth, subHeight, width, height) {
        var blackPoints = new Array(subHeight);
        for (var i = 0; i < subHeight; ++i) {
            blackPoints[i] = new Array(subWidth);
        }
        for (var y = 0; y < subHeight; y++) {
            var yoffset = y << BLOCK_SIZE_POWER;
            var maxYOffset = height - BLOCK_SIZE;
            if (yoffset > maxYOffset) {
                yoffset = maxYOffset;
            }
            for (var x = 0; x < subWidth; x++) {
                var xoffset = x << BLOCK_SIZE_POWER;
                var maxXOffset = width - BLOCK_SIZE;
                if (xoffset > maxXOffset) {
                    xoffset = maxXOffset;
                }
                var sum = 0;
                var min = 0xFF;
                var max = 0;
                for (var yy = 0, offset = yoffset * width + xoffset; yy < BLOCK_SIZE; yy++, offset += width) {
                    for (var xx = 0; xx < BLOCK_SIZE; xx++) {
                        var pixel = lums[offset + xx] & 0xFF;
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
                            for (var xx = 0; xx < BLOCK_SIZE; xx++) {
                                sum += lums[offset + xx] & 0xFF;
                            }
                        }
                    }
                }
                // The default estimate is the average of the values in the block.
                var average = sum >> (BLOCK_SIZE_POWER * 2);
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
                        var averageNeighborBlackPoint = (blackPoints[y - 1][x] + (2 * blackPoints[y][x - 1]) + blackPoints[y - 1][x - 1]) >> 2;
                        if (min < averageNeighborBlackPoint) {
                            average = averageNeighborBlackPoint;
                        }
                    }
                }
                blackPoints[y][x] = average;
            }
        }
        return blackPoints;
    };
    Binarizer.calculateThreshHold = function (lums, subWidth, subHeight, width, height, blackPoints) {
        var matrix = new BitMatrix(width, height);
        for (var y = 0; y < subHeight; y++) {
            var yoffset = y << BLOCK_SIZE_POWER;
            var maxYOffset = height - BLOCK_SIZE;
            if (yoffset > maxYOffset) {
                yoffset = maxYOffset;
            }
            for (var x = 0; x < subWidth; x++) {
                var xoffset = x << BLOCK_SIZE_POWER;
                var maxXOffset = width - BLOCK_SIZE;
                if (xoffset > maxXOffset) {
                    xoffset = maxXOffset;
                }
                var left = this.cap(x, 2, subWidth - 3);
                var top_1 = this.cap(y, 2, subHeight - 3);
                var sum = 0;
                for (var z = -2; z <= 2; z++) {
                    var blackRow = blackPoints[top_1 + z];
                    sum += blackRow[left - 2] + blackRow[left - 1] + blackRow[left]
                        + blackRow[left + 1] + blackRow[left + 2];
                }
                var average = ~~(sum / 25);
                this.treshholdBlock(lums, xoffset, yoffset, average, width, matrix);
            }
        }
        return matrix;
    };
    Binarizer.treshholdBlock = function (lums, xoffset, yoffset, threshold, stride, matrix) {
        for (var y = 0, offset = yoffset * stride + xoffset; y < BLOCK_SIZE; y++, offset += stride) {
            for (var x = 0; x < BLOCK_SIZE; x++) {
                var pixel = lums[offset + x] & 0xff;
                if (pixel <= threshold) {
                    matrix.set(xoffset + x, yoffset + y);
                }
            }
        }
    };
    Binarizer.cap = function (value, min, max) {
        return value < min ? min : value > max ? max : value;
    };
    return Binarizer;
}());
//# sourceMappingURL=binarizer.js.map