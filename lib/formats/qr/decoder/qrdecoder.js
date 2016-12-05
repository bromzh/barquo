import { BitStream } from '../../../core';
function toAlphaNumericByte(value) {
    var ALPHANUMERIC_CHARS = [
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
var QRMode;
(function (QRMode) {
    QRMode[QRMode["TERMINATOR"] = 0] = "TERMINATOR";
    QRMode[QRMode["NUMERIC"] = 1] = "NUMERIC";
    QRMode[QRMode["ALPHANUMERIC"] = 2] = "ALPHANUMERIC";
    QRMode[QRMode["STRUCTURED_APPEND"] = 3] = "STRUCTURED_APPEND";
    QRMode[QRMode["BYTE"] = 4] = "BYTE";
    QRMode[QRMode["FNC1_FIRST_POSITION"] = 5] = "FNC1_FIRST_POSITION";
    QRMode[QRMode["ECI"] = 7] = "ECI";
    QRMode[QRMode["KANJI"] = 8] = "KANJI";
    QRMode[QRMode["FNC1_SECOND_POSITION"] = 9] = "FNC1_SECOND_POSITION";
    QRMode[QRMode["HANZI"] = 13] = "HANZI";
})(QRMode || (QRMode = {}));
var QRMode;
(function (QRMode) {
    function getName(mode) {
        return QRMode[mode];
    }
    QRMode.getName = getName;
})(QRMode || (QRMode = {}));
var QRModeInfo = (function () {
    function QRModeInfo(characterCountBitsForVersions) {
        this.characterCountBitsForVersions = characterCountBitsForVersions;
    }
    QRModeInfo.prototype.getCharacterCountBits = function (version) {
        if (this.characterCountBitsForVersions == null) {
            throw new Error("Character count doesn't apply to this mode");
        }
        var offset;
        if (version <= 9) {
            offset = 0;
        }
        else if (version <= 26) {
            offset = 1;
        }
        else {
            offset = 2;
        }
        return this.characterCountBitsForVersions[offset];
    };
    return QRModeInfo;
}());
var qrmodes = (_a = {},
    _a[QRMode.TERMINATOR] = new QRModeInfo([0, 0, 0]),
    _a[QRMode.NUMERIC] = new QRModeInfo([10, 12, 14]),
    _a[QRMode.ALPHANUMERIC] = new QRModeInfo([9, 11, 13]),
    _a[QRMode.STRUCTURED_APPEND] = new QRModeInfo([0, 0, 0]),
    _a[QRMode.BYTE] = new QRModeInfo([8, 16, 16]),
    _a[QRMode.FNC1_FIRST_POSITION] = new QRModeInfo(null),
    _a[QRMode.ECI] = new QRModeInfo(null),
    _a[QRMode.KANJI] = new QRModeInfo([8, 10, 12]),
    _a[QRMode.FNC1_SECOND_POSITION] = new QRModeInfo(null),
    _a[QRMode.HANZI] = new QRModeInfo([8, 10, 12]),
    _a
);
function parseECIValue(bits) {
    var firstByte = bits.readBits(8);
    if ((firstByte & 0x80) === 0) {
        // just one byte
        return firstByte & 0x7F;
    }
    if ((firstByte & 0xC0) === 0x80) {
        // two bytes
        var secondByte = bits.readBits(8);
        return ((firstByte & 0x3F) << 8) | secondByte;
    }
    if ((firstByte & 0xE0) === 0xC0) {
        // three bytes
        var secondThirdBytes = bits.readBits(16);
        return ((firstByte & 0x1F) << 16) | secondThirdBytes;
    }
    throw new Error('Bad ECI bits starting with byte ' + firstByte);
}
function decodeHanziSegment(bits, result, count) {
    // Don't crash trying to scan more bits than we have available.
    if (count * 13 > bits.available()) {
        return false;
    }
    // Each character will require 2 bytes. Read the characters as 2-byte pairs
    // and decode as GB2312 afterwards
    var buffer = new Array(2 * count);
    var offset = 0;
    while (count > 0) {
        // Each 13 bits encodes a 2-byte character
        var twoBytes = bits.readBits(13);
        var assembledTwoBytes = (Math.floor(twoBytes / 0x060) << 8) | (twoBytes % 0x060);
        if (assembledTwoBytes < 0x003BF) {
            // In the 0xA1A1 to 0xAAFE range
            assembledTwoBytes += 0x0A1A1;
        }
        else {
            // In the 0xB0A1 to 0xFAFE range
            assembledTwoBytes += 0x0A6A1;
        }
        buffer[offset] = ((assembledTwoBytes >> 8) & 0xFF);
        buffer[offset + 1] = (assembledTwoBytes & 0xFF);
        offset += 2;
        count--;
    }
    (_a = result.val).push.apply(_a, buffer);
    return true;
    var _a;
}
function decodeNumericSegment(bits, result, count) {
    // Read three digits at a time
    while (count >= 3) {
        // Each 10 bits encodes three digits
        if (bits.available() < 10) {
            return false;
        }
        var threeDigitsBits = bits.readBits(10);
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
        var twoDigitsBits = bits.readBits(7);
        if (twoDigitsBits >= 100) {
            return false;
        }
        result.val.push(toAlphaNumericByte(Math.floor(twoDigitsBits / 10)));
        result.val.push(toAlphaNumericByte(twoDigitsBits % 10));
    }
    else if (count === 1) {
        // One digit left over to scan
        if (bits.available() < 4) {
            return false;
        }
        var digitBits = bits.readBits(4);
        if (digitBits >= 10) {
            return false;
        }
        result.val.push(toAlphaNumericByte(digitBits));
    }
    return true;
}
function decodeAlphanumericSegment(bits, result, count, fc1InEffect) {
    // Read two characters at a time
    var start = result.val.length;
    while (count > 1) {
        if (bits.available() < 11) {
            return false;
        }
        var nextTwoCharsBits = bits.readBits(11);
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
        for (var i = start; i < result.val.length; i++) {
            if (result.val[i] === '%'.charCodeAt(0)) {
                if (i < result.val.length - 1 && result.val[i + 1] === '%'.charCodeAt(0)) {
                    // %% is rendered as %
                    result.val = result.val.slice(0, i + 1)
                        .concat(result.val.slice(i + 2));
                }
                else {
                    // In alpha mode, % should be converted to FNC1 separator 0x1D
                    // THIS IS ALMOST CERTAINLY INVALID
                    result.val[i] = 0x1D;
                }
            }
        }
    }
    return true;
}
function decodeByteSegment(bits, result, count) {
    // Don't crash trying to scan more bits than we have available.
    if (count << 3 > bits.available()) {
        return false;
    }
    var readBytes = new Array(count);
    for (var i = 0; i < count; i++) {
        readBytes[i] = bits.readBits(8);
    }
    (_a = result.val).push.apply(_a, readBytes);
    return true;
    var _a;
}
var GB2312_SUBSET = 1;
// Takes in a byte array, a qr version number and an error correction level.
// Returns decoded data.
export function decodeQRdata(data, version, ecl) {
    var symbolSequence = -1;
    var parityData = -1;
    var bits = new BitStream(data);
    // Have to pass this around so functions can share a reference to a number[]
    var result = { val: [] };
    var fc1InEffect = false;
    var mode;
    while (mode !== QRMode.TERMINATOR) {
        // While still another segment to scan...
        if (bits.available() < 4) {
            // OK, assume we're done. Really, a TERMINATOR mode should have been recorded here
            mode = QRMode.TERMINATOR;
        }
        else {
            mode = bits.readBits(4); // mode is encoded by 4 bits
        }
        if (mode !== QRMode.TERMINATOR) {
            if (mode === QRMode.FNC1_FIRST_POSITION || mode === QRMode.FNC1_SECOND_POSITION) {
                // We do little with FNC1 except alter the parsed result a bit according to the spec
                fc1InEffect = true;
            }
            else if (mode === QRMode.STRUCTURED_APPEND) {
                if (bits.available() < 16) {
                    return null;
                }
                // not really supported; but sequence number and parity is added later to the result metadata
                // Read next 8 bits (symbol sequence #) and 8 bits (parity data), then continue
                symbolSequence = bits.readBits(8);
                parityData = bits.readBits(8);
            }
            else if (mode === QRMode.ECI) {
                // Ignore since we don't do character encoding in JS
                var value = parseECIValue(bits);
                if (value < 0 || value > 30) {
                    return null;
                }
            }
            else {
                // First handle Hanzi mode which does not start with character count
                if (mode === QRMode.HANZI) {
                    // chinese mode contains a sub set indicator right after mode indicator
                    var subset = bits.readBits(4);
                    var countHanzi = bits.readBits(qrmodes[mode].getCharacterCountBits(version));
                    if (subset === GB2312_SUBSET) {
                        if (!decodeHanziSegment(bits, result, countHanzi)) {
                            return null;
                        }
                    }
                }
                else {
                    // "Normal" QR code modes:
                    // How many characters will follow, encoded in this mode?
                    var count = bits.readBits(qrmodes[mode].getCharacterCountBits(version));
                    if (mode === QRMode.NUMERIC) {
                        if (!decodeNumericSegment(bits, result, count)) {
                            return null;
                        }
                    }
                    else if (mode === QRMode.ALPHANUMERIC) {
                        if (!decodeAlphanumericSegment(bits, result, count, fc1InEffect)) {
                            return null;
                        }
                    }
                    else if (mode === QRMode.BYTE) {
                        if (!decodeByteSegment(bits, result, count)) {
                            return null;
                        }
                    }
                    else if (mode === QRMode.KANJI) {
                    }
                    else {
                        return null;
                    }
                }
            }
        }
    }
    return result.val;
}
var _a;
//# sourceMappingURL=qrdecoder.js.map