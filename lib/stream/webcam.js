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
        return navigator.mediaDevices.getUserMedia({ video: videoOptions });
    };
    WebCam.prototype.start = function (videoOptions) {
        var _this = this;
        if (videoOptions === void 0) { videoOptions = true; }
        this.getStream(videoOptions)
            .then(function (stream) {
            _this.isStreaming = true;
            _this.video.srcObject = stream;
            _this.video.onloadedmetadata = function (e) { return _this.video.play(); };
        });
    };
    WebCam.prototype.stop = function () {
        this.video.srcObject.getTracks()[0].stop();
        this.video.srcObject = null;
        this.isStreaming = false;
    };
    return WebCam;
}());
//# sourceMappingURL=webcam.js.map