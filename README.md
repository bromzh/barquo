# Barquo

Library for decoding barcodes written in pure Typescript. 
Now supports only QRcode format, but work in progress. Support for Code128 coming soon.

## Usage

Install
```
npm i -S barquo
```

Add html
```html
<canvas></canvas>
<video autoplay></video>
<button type="button">Read</button>
```

Use scanner
```typescript
import { StreamScanner, QrReader } from 'barquo';

let canvas = document.querySelector('canvas');
let video = document.querySelector('video');
let button = document.querySelector('button');

let streamReader = new StreamScanner(canvas, video, new QrReader());

button.onclick = () => streamReader.scanStream().then(result => console.log(result));
```

## Thanks
Thanks to [cosmo's jsQR](https://github.com/cozmo/jsQR) and [ZXing project](https://github.com/zxing/zxing).