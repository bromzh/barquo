import { Reader, Result } from 'barquo/core';
import { WebCam } from './webcam';
export declare class StreamScanner {
    canvas: HTMLCanvasElement;
    width: number;
    height: number;
    reader: Reader;
    webcam: WebCam;
    ctx: CanvasRenderingContext2D;
    constructor(canvas: HTMLCanvasElement, video: HTMLVideoElement, width?: number, height?: number);
    takeShot(): ImageData;
    decode(img: ImageData): Result;
    scan(): Result;
    scanStream(frequency?: number): Promise<Result>;
    stopScanning(): void;
}
