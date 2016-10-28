import { Result } from './result';
export interface Reader {
    decode(image: ImageData): Result;
}
