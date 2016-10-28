export var BitArray = (function () {
    function BitArray(length) {
        if (length === void 0) { length = 0; }
        this.length = length;
        if (!Number.isInteger(length)) {
            throw new RangeError("Invalid length (safe) " + length);
        }
        if (length < 0) {
            throw new RangeError("Invalid length (<) " + length);
        }
        this.length = length;
        var bytes = (length + 8) >> 3;
        var buffer = new ArrayBuffer(bytes);
        this.bits = new Int8Array(buffer);
    }
    Object.defineProperty(BitArray.prototype, "byteLength", {
        // length: number;
        get: function () {
            return this.bits.byteLength;
        },
        enumerable: true,
        configurable: true
    });
    BitArray.prototype.get = function (idx) {
        if (this.outOfRange(idx)) {
            throw new RangeError("Invalid index " + idx);
        }
        return (this.bits[idx >> 3] & (1 << (idx & 7))) !== 0;
    };
    BitArray.prototype.set = function (idx) {
        if (this.outOfRange(idx)) {
            throw new RangeError("Invalid index " + idx);
        }
        this.bits[idx >> 3] |= 1 << (idx & 7);
    };
    BitArray.prototype.unset = function (idx) {
        if (this.outOfRange(idx)) {
            throw new RangeError("Invalid index " + idx);
        }
        this.bits[idx >> 3] &= ~(1 << (idx & 7));
    };
    // flip(idx: number): void {
    //     if (this.outOfRange(idx)) {
    //         throw new RangeError(`Invalid index ${idx}`);
    //     }
    //     this.bits[idx >> 3] ^= 1 << (idx & 7);
    // }
    BitArray.prototype.toBooleanArray = function () {
        var result = new Array(this.length);
        for (var i = 0; i < this.length; ++i) {
            result[i] = this.get(i);
        }
        return result;
    };
    BitArray.prototype.toNumberArray = function () {
        var result = new Array(this.byteLength);
        for (var i = 0; i < this.byteLength; ++i) {
            result[i] = this.bits[i];
        }
        return result;
    };
    BitArray.prototype.toArrayBuffer = function () {
        return this.bits.buffer;
    };
    BitArray.prototype.outOfRange = function (idx) {
        return idx < 0 || idx >= this.length;
    };
    return BitArray;
}());
//# sourceMappingURL=bitarray.js.map