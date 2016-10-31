export declare class WebCam {
    video: HTMLVideoElement;
    readonly isRunning: boolean;
    private isStreaming;
    constructor(video: HTMLVideoElement);
    getStream(videoOptions?: boolean | MediaTrackConstraints): PromiseLike<MediaStream>;
    start(videoOptions?: boolean | MediaTrackConstraints): void;
    stop(): void;
}
