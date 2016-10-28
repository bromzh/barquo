import { Reader, Result, Binarizer, BarcodeType, byteArrayToString } from 'barquo/core';
import { locate } from './locate';
import { extract } from './extract';
import { decode } from './decoder';

export class QrReader implements Reader {
    decode(image: ImageData): Result {
        let bitMatrix = Binarizer.getMatrix(image);

        let location = locate(bitMatrix);
        if (!location) return null;

        let raw = extract(bitMatrix, location);
        if (!raw) return null;

        let decoded = decode(raw);
        if (!decoded) return null;

        return {
            text: byteArrayToString(decoded),
            raw: decoded,
            format: { name: 'QR', type: BarcodeType.MATRIX },
        };
    }
}
