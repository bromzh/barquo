import { Reader, Result } from 'barquo/core';
export declare class Code128Reader implements Reader {
    decode(image: ImageData): Result;
    private doDecode(image);
}
