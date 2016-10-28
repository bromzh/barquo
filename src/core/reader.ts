import { Result } from './result';
// import { Bitmap } from 'barquo/core';

export interface Reader {
    decode(image: ImageData): Result;
}
