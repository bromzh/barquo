export function byteArrayToString(bytes) {
    var str = '';
    if (bytes !== null && bytes !== undefined) {
        for (var i = 0; i < bytes.length; i++) {
            str += String.fromCharCode(bytes[i]);
        }
    }
    return str;
}
//# sourceMappingURL=result.js.map