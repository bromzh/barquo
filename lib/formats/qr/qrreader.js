import { Binarizer, BarcodeType, byteArrayToString } from 'barquo/core';
import { locate } from './locate';
import { extract } from './extract';
import { decode } from './decoder';
export var QrReader = (function () {
    function QrReader() {
    }
    QrReader.prototype.decode = function (image) {
        var bitMatrix = Binarizer.getMatrix(image);
        var location = locate(bitMatrix);
        if (!location)
            return null;
        var raw = extract(bitMatrix, location);
        if (!raw)
            return null;
        var decoded = decode(raw);
        if (!decoded)
            return null;
        return {
            text: byteArrayToString(decoded),
            raw: decoded,
            format: { name: 'QR', type: BarcodeType.MATRIX },
        };
    };
    return QrReader;
}());
//# sourceMappingURL=qrreader.js.map