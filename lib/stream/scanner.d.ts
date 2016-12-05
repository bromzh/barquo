import { Reader, Result } from '../core';
import { WebCam } from './webcam';
export interface ScannerOptions {
    width: number;
    height: number;
}
export declare class StreamScanner {
    canvas: HTMLCanvasElement;
    webcam: WebCam;
    reader: Reader;
    ctx: CanvasRenderingContext2D;
    intervalHandler: number;
    constructor(canvas: HTMLCanvasElement, webcam: WebCam, reader: Reader, {width, height}?: ScannerOptions);
    takeShot(): ImageData;
    decode(img: ImageData): Result;
    scan(videoOptions?: boolean | MediaTrackConstraints): Result;
    scanStream(frequency?: number, videoOptions?: boolean | MediaTrackConstraints): Promise<Result>;
    stopScanning(): void;
}
