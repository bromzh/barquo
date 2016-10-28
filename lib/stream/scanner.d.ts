import { Reader, Result } from '../core';
import { WebCam } from './webcam';
export interface ScannerOptions {
    width: number;
    height: number;
}
export declare class StreamScanner {
    canvas: HTMLCanvasElement;
    reader: Reader;
    webcam: WebCam;
    ctx: CanvasRenderingContext2D;
    constructor(canvas: HTMLCanvasElement, video: HTMLVideoElement, reader: Reader, {width, height}?: ScannerOptions);
    takeShot(): ImageData;
    decode(img: ImageData): Result;
    scan(): Result;
    scanStream(frequency?: number): Promise<Result>;
    stopScanning(): void;
}
