import { BitStream } from '../../../core';

function toAlphaNumericByte(value: number): number {
    let ALPHANUMERIC_CHARS: string[] = [
        '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B',
        'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N',
        'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
        ' ', '$', '%', '*', '+', '-', '.', '/', ':',
    ];
    if (value >= ALPHANUMERIC_CHARS.length) {
        throw new Error('Could not decode alphanumeric char');
    }
    return ALPHANUMERIC_CHARS[value].charCodeAt(0);
}

enum QRMode {
    TERMINATOR = 0x00,
    NUMERIC = 0x01,
    ALPHANUMERIC = 0x02,
    STRUCTURED_APPEND = 0x03,
    BYTE = 0x04,
    FNC1_FIRST_POSITION = 0x05,
    ECI = 0x07,
    KANJI = 0x08,
    FNC1_SECOND_POSITION = 0x09,
    HANZI = 0x0D,
}

namespace QRMode {
    export function getName(mode: QRMode): string {
        return QRMode[mode];
    }
}

class QRModeInfo {
    constructor(public characterCountBitsForVersions: number[]) { }

    getCharacterCountBits(version: number): number {
        if (this.characterCountBitsForVersions == null) {
            throw new Error("Character count doesn't apply to this mode");
        }
        let offset: number;
        if (version <= 9) {
            offset = 0;
        } else if (version <= 26) {
            offset = 1;
        } else {
            offset = 2;
        }
        return this.characterCountBitsForVersions[offset];
    }
}

const qrmodes: { [index: number]: QRModeInfo } = {
    [QRMode.TERMINATOR]: new QRModeInfo([0, 0, 0]),
    [QRMode.NUMERIC]: new QRModeInfo([10, 12, 14]),
    [QRMode.ALPHANUMERIC]: new QRModeInfo([9, 11, 13]),
    [QRMode.STRUCTURED_APPEND]: new QRModeInfo([0, 0, 0]),
    [QRMode.BYTE]: new QRModeInfo([8, 16, 16]),
    [QRMode.FNC1_FIRST_POSITION]: new QRModeInfo(null),
    [QRMode.ECI]: new QRModeInfo(null),
    [QRMode.KANJI]: new QRModeInfo([8, 10, 12]),
    [QRMode.FNC1_SECOND_POSITION]: new QRModeInfo(null),
    [QRMode.HANZI]: new QRModeInfo([8, 10, 12]),
};

function parseECIValue(bits: BitStream): number {
    let firstByte = bits.readBits(8);
    if ((firstByte & 0x80) === 0) {
        // just one byte
        return firstByte & 0x7F;
    }
    if ((firstByte & 0xC0) === 0x80) {
        // two bytes
        let secondByte = bits.readBits(8);
        return ((firstByte & 0x3F) << 8) | secondByte;
    }
    if ((firstByte & 0xE0) === 0xC0) {
        // three bytes
        let secondThirdBytes = bits.readBits(16);
        return ((firstByte & 0x1F) << 16) | secondThirdBytes;
    }
    throw new Error('Bad ECI bits starting with byte ' + firstByte);
}

interface ResultByteArray {
    val: number[];
}

function decodeHanziSegment(bits: BitStream, result: ResultByteArray, count: number): boolean {
    // Don't crash trying to scan more bits than we have available.
    if (count * 13 > bits.available()) {
        return false;
    }

    // Each character will require 2 bytes. Read the characters as 2-byte pairs
    // and decode as GB2312 afterwards
    let buffer: number[] = new Array(2 * count);
    let offset = 0;
    while (count > 0) {
        // Each 13 bits encodes a 2-byte character
        let twoBytes = bits.readBits(13);
        let assembledTwoBytes = (Math.floor(twoBytes / 0x060) << 8) | (twoBytes % 0x060);
        if (assembledTwoBytes < 0x003BF) {
            // In the 0xA1A1 to 0xAAFE range
            assembledTwoBytes += 0x0A1A1;
        } else {
            // In the 0xB0A1 to 0xFAFE range
            assembledTwoBytes += 0x0A6A1;
        }
        buffer[offset] = ((assembledTwoBytes >> 8) & 0xFF);
        buffer[offset + 1] = (assembledTwoBytes & 0xFF);
        offset += 2;
        count--;
    }
    result.val.push(...buffer);
    return true;
}

function decodeNumericSegment(bits: BitStream, result: ResultByteArray, count: number): boolean {
    // Read three digits at a time
    while (count >= 3) {
        // Each 10 bits encodes three digits
        if (bits.available() < 10) {
            return false;
        }
        let threeDigitsBits = bits.readBits(10);
        if (threeDigitsBits >= 1000) {
            return false;
        }
        result.val.push(toAlphaNumericByte(Math.floor(threeDigitsBits / 100)));
        result.val.push(toAlphaNumericByte(Math.floor(threeDigitsBits / 10) % 10));
        result.val.push(toAlphaNumericByte(threeDigitsBits % 10));

        count -= 3;
    }
    if (count === 2) {
        // Two digits left over to scan, encoded in 7 bits
        if (bits.available() < 7) {
            return false;
        }
        let twoDigitsBits = bits.readBits(7);
        if (twoDigitsBits >= 100) {
            return false;
        }
        result.val.push(toAlphaNumericByte(Math.floor(twoDigitsBits / 10)));
        result.val.push(toAlphaNumericByte(twoDigitsBits % 10));
    } else if (count === 1) {
        // One digit left over to scan
        if (bits.available() < 4) {
            return false;
        }
        let digitBits = bits.readBits(4);
        if (digitBits >= 10) {
            return false;
        }
        result.val.push(toAlphaNumericByte(digitBits));
    }
    return true;
}

function decodeAlphanumericSegment(bits: BitStream, result: ResultByteArray, count: number, fc1InEffect: boolean) {
    // Read two characters at a time
    let start = result.val.length;
    while (count > 1) {
        if (bits.available() < 11) {
            return false;
        }
        let nextTwoCharsBits = bits.readBits(11);
        result.val.push(toAlphaNumericByte(Math.floor(nextTwoCharsBits / 45)));
        result.val.push(toAlphaNumericByte(nextTwoCharsBits % 45));
        count -= 2;
    }
    if (count === 1) {
        // special case: one character left
        if (bits.available() < 6) {
            return false;
        }
        result.val.push(toAlphaNumericByte(bits.readBits(6)));
    }
    // See section 6.4.8.1, 6.4.8.2
    if (fc1InEffect) {
        // We need to massage the result a bit if in an FNC1 mode:
        for (let i = start; i < result.val.length; i++) {
            if (result.val[i] === '%'.charCodeAt(0)) {
                if (i < result.val.length - 1 && result.val[i + 1] === '%'.charCodeAt(0)) {
                    // %% is rendered as %
                    result.val = result.val.slice(0, i + 1)
                        .concat(result.val.slice(i + 2));
                } else {
                    // In alpha mode, % should be converted to FNC1 separator 0x1D
                    // THIS IS ALMOST CERTAINLY INVALID
                    result.val[i] = 0x1D;
                }
            }
        }
    }
    return true;
}

function decodeByteSegment(bits: BitStream, result: ResultByteArray, count: number): boolean {
    // Don't crash trying to scan more bits than we have available.
    if (count << 3 > bits.available()) {
        return false;
    }

    let readBytes: number[] = new Array(count);
    for (let i = 0; i < count; i++) {
        readBytes[i] = bits.readBits(8);
    }
    result.val.push(...readBytes);
    return true;
}

let GB2312_SUBSET = 1;

// Takes in a byte array, a qr version number and an error correction level.
// Returns decoded data.
export function decodeQRdata(data: number[], version: number, ecl: string): number[] {
    let symbolSequence = -1;
    let parityData = -1;

    let bits = new BitStream(data);
    // Have to pass this around so functions can share a reference to a number[]
    let result: ResultByteArray = { val: <number[]>[] };
    let fc1InEffect = false;
    let mode: QRMode;

    while (mode !== QRMode.TERMINATOR) {
        // While still another segment to scan...
        if (bits.available() < 4) {
            // OK, assume we're done. Really, a TERMINATOR mode should have been recorded here
            mode = QRMode.TERMINATOR;
        } else {
            mode = bits.readBits(4); // mode is encoded by 4 bits
        }
        if (mode !== QRMode.TERMINATOR) {
            if (mode === QRMode.FNC1_FIRST_POSITION || mode === QRMode.FNC1_SECOND_POSITION) {
                // We do little with FNC1 except alter the parsed result a bit according to the spec
                fc1InEffect = true;
            } else if (mode === QRMode.STRUCTURED_APPEND) {
                if (bits.available() < 16) {
                    return null;
                }
                // not really supported; but sequence number and parity is added later to the result metadata
                // Read next 8 bits (symbol sequence #) and 8 bits (parity data), then continue
                symbolSequence = bits.readBits(8);
                parityData = bits.readBits(8);
            } else if (mode === QRMode.ECI) {
                // Ignore since we don't do character encoding in JS
                let value = parseECIValue(bits);
                if (value < 0 || value > 30) {
                    return null;
                }
            } else {
                // First handle Hanzi mode which does not start with character count
                if (mode === QRMode.HANZI) {
                    // chinese mode contains a sub set indicator right after mode indicator
                    let subset = bits.readBits(4);
                    let countHanzi = bits.readBits(qrmodes[mode].getCharacterCountBits(version));
                    if (subset === GB2312_SUBSET) {
                        if (!decodeHanziSegment(bits, result, countHanzi)) {
                            return null;
                        }
                    }
                } else {
                    // "Normal" QR code modes:
                    // How many characters will follow, encoded in this mode?
                    let count = bits.readBits(qrmodes[mode].getCharacterCountBits(version));
                    if (mode === QRMode.NUMERIC) {
                        if (!decodeNumericSegment(bits, result, count)) {
                            return null;
                        }
                    } else if (mode === QRMode.ALPHANUMERIC) {
                        if (!decodeAlphanumericSegment(bits, result, count, fc1InEffect)) {
                            return null;
                        }
                    } else if (mode === QRMode.BYTE) {
                        if (!decodeByteSegment(bits, result, count)) {
                            return null;
                        }
                    } else if (mode === QRMode.KANJI) {
                        // if (!decodeKanjiSegment(bits, result, count)){
                        //   return null;
                        // }
                    } else {
                        return null;
                    }
                }
            }
        }
    }
    return result.val;
}

