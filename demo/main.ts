import { StreamScanner, QrReader, WebCam } from 'barquo';

function main() {
    let canvas = document.querySelector('canvas');
    let video = document.querySelector('video');
    let start = document.querySelector('#start') as HTMLButtonElement;
    let sw = document.querySelector('#switch') as HTMLButtonElement;
    let resultSpan = document.querySelector('#result') as HTMLSpanElement;

    let webcam = new WebCam(video);
    let streamReader = new StreamScanner(canvas, webcam, new QrReader());

    webcam.getWebCams().then(devices => updateSelect(devices));

    let s = () => streamReader.scanStream(1000, { deviceId: sw.value }).then(result => {
        resultSpan.innerHTML = result.text;
    });

    start.onclick = () => s();
    sw.onchange = () => {
        streamReader.stopScanning();
        s();
    };

    function updateSelect(devices: MediaDeviceInfo[]) {
        let options = devices.map(device => `<option value="${device.deviceId}">${device.label}</option>`);
        sw.innerHTML = options.join('');
    }

    // button.onclick = () => streamReader.scanStream().then(result => console.log('RESULT', result));

    // streamReader.scan().then(result => console.log('RESULT', result));
}

function bootstrapDomReady() {
    return document.addEventListener('DOMContentLoaded', main);
}

if (document.readyState === 'complete') {
    main();
} else {
    bootstrapDomReady();
}
declare let module: any;
module.hot.accept();

