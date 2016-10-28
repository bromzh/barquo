import { BitArray } from 'barquo/core';
export var Code128Reader = (function () {
    function Code128Reader() {
    }
    Code128Reader.prototype.decode = function (image) {
        return null;
    };
    Code128Reader.prototype.doDecode = function (image) {
        var width = image.width;
        var height = image.height;
        var row = new BitArray(width);
        var middle = height >> 1;
        var rowStep = Math.max(1, height >> 8);
        var maxLines = height;
        for (var x = 0; x < maxLines; ++x) {
            var rowStepsAboveOrBelow = (x + 1) >> 1;
            var isAbove = (x && 1) === 0;
            var rowNumber = middle + rowStep * (isAbove ? rowStepsAboveOrBelow : -rowStepsAboveOrBelow);
            if (rowNumber < 0 || rowNumber >= height) {
                break;
            }
        }
        // getBlackRow(image, rowNumber);
        return null;
    };
    return Code128Reader;
}());
//# sourceMappingURL=code128reader.js.map