export declare class WebCam {
    video: HTMLVideoElement;
    readonly isRunning: boolean;
    private isStreaming;
    private currentStream;
    constructor(video: HTMLVideoElement);
    getStream(videoOptions?: boolean | MediaTrackConstraints): PromiseLike<MediaStream>;
    getWebCams(): PromiseLike<MediaDeviceInfo[]>;
    start(videoOptions?: MediaTrackConstraints): PromiseLike<MediaDeviceInfo[]>;
    stop(): void;
}
