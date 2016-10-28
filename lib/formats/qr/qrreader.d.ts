import { Reader, Result } from 'barquo/core';
export declare class QrReader implements Reader {
    decode(image: ImageData): Result;
}
