import { WebCam } from './webcam';
import { QrReader } from 'barquo/formats';
export var StreamScanner = (function () {
    function StreamScanner(canvas, video, reader, _a) {
        var _b = _a === void 0 ? { width: 640, height: 480 } : _a, width = _b.width, height = _b.height;
        this.canvas = canvas;
        this.reader = reader;
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = width;
        this.canvas.height = height;
        // video = video || document.createElement('video');
        this.webcam = new WebCam(video);
        this.reader = new QrReader();
    }
    StreamScanner.prototype.takeShot = function () {
        this.ctx.drawImage(this.webcam.video, 0, 0);
        return this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    };
    StreamScanner.prototype.decode = function (img) {
        return this.reader.decode(img);
    };
    StreamScanner.prototype.scan = function () {
        if (!this.webcam.isRunning) {
            this.webcam.start();
        }
        var img = this.takeShot();
        return this.decode(img);
    };
    StreamScanner.prototype.scanStream = function (frequency) {
        var _this = this;
        if (frequency === void 0) { frequency = 250; }
        return new Promise(function (resolve, reject) {
            var intervalHandler = setInterval(function () {
                var result = _this.scan();
                if (result !== null) {
                    _this.stopScanning(); // TODO make as callback
                    clearInterval(intervalHandler);
                    resolve(result);
                }
            }, frequency);
        });
    };
    StreamScanner.prototype.stopScanning = function () {
        this.webcam.stop();
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    };
    return StreamScanner;
}());
//# sourceMappingURL=scanner.js.map