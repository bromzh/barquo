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
    WebCam.prototype.getStream = function () {
        return navigator.mediaDevices.getUserMedia({ video: true });
    };
    WebCam.prototype.start = function () {
        var _this = this;
        this.getStream()
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