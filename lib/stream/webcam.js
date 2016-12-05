function getUserMedia(constraints) {
    // First get ahold of the legacy getUserMedia, if present
    var getUserMediaLegacy = (navigator.getUserMedia
        || navigator.webkitGetUserMedia
        || navigator.mozGetUserMedia);
    // Some browsers just don't implement it - return a rejected promise with an error
    // to keep a consistent interface
    if (!navigator.mediaDevices && !getUserMediaLegacy) {
        return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
    }
    // Otherwise, wrap the call to the old navigator.getUserMedia with a Promise
    return new Promise(function (resolve, reject) {
        getUserMediaLegacy.call(navigator, constraints, resolve, reject);
    });
}
function getVideoDevices() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        return Promise.reject(new Error('enumerateDevices is not implemented in this browser'));
    }
    return navigator.mediaDevices.enumerateDevices()
        .then(function (devices) { return devices.filter(function (device) { return device.kind === 'videoinput'; }); });
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
export var WebCam = (function () {
    function WebCam(video) {
        this.video = video;
    }
    Object.defineProperty(WebCam.prototype, "isRunning", {
        get: function () {
            return this.isStreaming;
        },
        enumerable: true,
        configurable: true
    });
    WebCam.prototype.getStream = function (videoOptions) {
        if (videoOptions === void 0) { videoOptions = true; }
        return getUserMedia({ video: videoOptions });
    };
    WebCam.prototype.getWebCams = function () {
        return getVideoDevices();
    };
    // getFirstDeviceOptions(devices: MediaDeviceInfo[]) {
    //     this.availableDevices
    // }
    WebCam.prototype.start = function (videoOptions) {
        // console.log('starting with wo', videoOptions);
        var _this = this;
        if (videoOptions === void 0) { videoOptions = {}; }
        return this.getStream(videoOptions)
            .then(function (stream) {
            _this.isStreaming = true;
            _this.currentStream = stream;
            _this.video.srcObject = stream;
            return _this.getWebCams();
        });
    };
    WebCam.prototype.stop = function () {
        this.currentStream.getTracks().forEach(function (track) { return track.stop(); });
        this.isStreaming = false;
        // this.video.srcObject;
        // this.currentStream = null;
        // this.currentDevice = null;
    };
    return WebCam;
}());
//# sourceMappingURL=webcam.js.map