// import { StreamScanner, QrReader } from 'barquo';

function main() {
    let canvas = document.querySelector('canvas');
    // let video = document.querySelector('video');
    let button = document.querySelector('button');
    let img = document.querySelector('img');

    let context = canvas.getContext('2d');

    context.drawImage(img, 0, 0, 2, 2);

    button.onclick = () => console.log(context.getImageData(0, 0, 2, 2));

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

