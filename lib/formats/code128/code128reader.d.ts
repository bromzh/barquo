import { Reader, Result } from '../../core';
export declare class Code128Reader implements Reader {
    decode(image: ImageData): Result;
    private doDecode(image);
}
