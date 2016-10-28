export declare class WebCam {
    video: HTMLVideoElement;
    readonly isRunning: boolean;
    private isStreaming;
    constructor(video: HTMLVideoElement);
    getStream(): PromiseLike<MediaStream>;
    start(): void;
    stop(): void;
}
