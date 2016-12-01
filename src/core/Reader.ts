import { Result } from './Result';
export interface Reader {
    decode(image: ImageData): Result;
}
