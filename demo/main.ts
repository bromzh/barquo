import { StreamScanner } from 'barquo/stream';
import { QrReader } from 'barquo/formats';

function main() {
    let canvas = document.querySelector('canvas');
    let video = document.querySelector('video');
    let button = document.querySelector('button');

    let streamReader = new StreamScanner(canvas, video, new QrReader());

    button.onclick = () => streamReader.scanStream().then(result => console.log('RESULT', result));

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

