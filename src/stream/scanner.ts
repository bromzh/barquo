import { Reader, Result } from '../core';
import { WebCam } from './webcam';
import { QrReader } from '../formats';

export interface ScannerOptions {
    width: number;
    height: number;
}

export class StreamScanner {
    webcam: WebCam;
    ctx: CanvasRenderingContext2D;

    constructor(public canvas: HTMLCanvasElement, video: HTMLVideoElement, public reader: Reader,
        { width, height }: ScannerOptions = { width: 640, height: 480 }) {
        this.ctx = this.canvas.getContext('2d');

        this.canvas.width = width;
        this.canvas.height = height;

        // video = video || document.createElement('video');
        this.webcam = new WebCam(video);

        this.reader = new QrReader();
    }

    takeShot(): ImageData {
        this.ctx.drawImage(this.webcam.video, 0, 0);
        return this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    }

    decode(img: ImageData): Result {
        return this.reader.decode(img);
    }

    scan(videoOptions: boolean | MediaTrackConstraints = true): Result {
        if (!this.webcam.isRunning) {
            this.webcam.start(videoOptions);
        }
        let img = this.takeShot();
        return this.decode(img);
    }

    scanStream(frequency: number = 250, videoOptions: boolean | MediaTrackConstraints = true): Promise<Result> {
        return new Promise((resolve, reject) => {
            let intervalHandler = setInterval(() => {
                let result = this.scan(videoOptions);
                if (result !== null) {
                    this.stopScanning(); // TODO make as callback
                    clearInterval(intervalHandler);
                    resolve(result);
                }
            }, frequency);
        });
    }

    stopScanning() {
        this.webcam.stop();
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

}
