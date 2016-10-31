export class WebCam {
    get isRunning(): boolean {
        return this.isStreaming;
    }

    private isStreaming: boolean;

    constructor(public video: HTMLVideoElement) {}

    getStream(videoOptions: boolean | MediaTrackConstraints = true): PromiseLike<MediaStream> {
        return navigator.mediaDevices.getUserMedia({ video: videoOptions });
    }

    start(videoOptions: boolean | MediaTrackConstraints = true): void {
        this.getStream(videoOptions)
            .then(stream => {
                this.isStreaming = true;
                this.video.srcObject = stream;
                this.video.onloadedmetadata = e => this.video.play();
            });
    }

    stop(): void {
        this.video.srcObject.getTracks()[0].stop();
        this.video.srcObject = null;
        this.isStreaming = false;
    }
}