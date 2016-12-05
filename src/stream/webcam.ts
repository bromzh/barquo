function getUserMedia(constraints: MediaStreamConstraints): PromiseLike<MediaStream> {
    // First get ahold of the legacy getUserMedia, if present
    let getUserMediaLegacy = (navigator.getUserMedia
        || (navigator as any).webkitGetUserMedia
        || (navigator as any).mozGetUserMedia
    );

    // Some browsers just don't implement it - return a rejected promise with an error
    // to keep a consistent interface
    if (!navigator.mediaDevices && !getUserMediaLegacy) {
        return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
    }

    // Otherwise, wrap the call to the old navigator.getUserMedia with a Promise
    return new Promise((resolve, reject) => {
        getUserMediaLegacy.call(navigator, constraints, resolve, reject);
    });
}

function getVideoDevices(): PromiseLike<MediaDeviceInfo[]> {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        return Promise.reject(new Error('enumerateDevices is not implemented in this browser'));
    }
    return navigator.mediaDevices.enumerateDevices()
        .then((devices: MediaDeviceInfo[]) => devices.filter(device => device.kind === 'videoinput'));
}

// function userMediaPolyfill() {
//     if (navigator.mediaDevices === undefined) {
//         (navigator as any).mediaDevices = {};
//     }
//     // Some browsers partially implement mediaDevices. We can't just assign an object
//     // with getUserMedia as it would overwrite existing properties.
//     // Here, we will just add the getUserMedia property if it's missing.
//     if (navigator.mediaDevices.getUserMedia === undefined) {
//         navigator.mediaDevices.getUserMedia = getUserMedia;
//     }
// }

export class WebCam {
    get isRunning(): boolean {
        return this.isStreaming;
    }

    private isStreaming: boolean;
    private currentStream: MediaStream;

    constructor(public video: HTMLVideoElement) {}

    getStream(videoOptions: boolean | MediaTrackConstraints = true): PromiseLike<MediaStream> {
        return getUserMedia({ video: videoOptions });
    }

    getWebCams(): PromiseLike<MediaDeviceInfo[]> {
        return getVideoDevices();
    }

    // getFirstDeviceOptions(devices: MediaDeviceInfo[]) {
    //     this.availableDevices
    // }

    start(videoOptions: MediaTrackConstraints = {}): PromiseLike<MediaDeviceInfo[]> {
        // console.log('starting with wo', videoOptions);

        return this.getStream(videoOptions)
            .then(stream => {
                this.isStreaming = true;
                this.currentStream = stream;
                this.video.srcObject = stream;
                return this.getWebCams();
            });
    }

    stop(): void {
        this.currentStream.getTracks().forEach(track => track.stop());
        this.isStreaming = false;
        // this.video.srcObject;
        // this.currentStream = null;
        // this.currentDevice = null;
    }
}
