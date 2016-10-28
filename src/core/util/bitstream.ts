export class BitStream {
    private bytes: number[];
    private byteOffset: number = 0;
    private bitOffset: number = 0;

    constructor(bytes: number[]) {
        this.bytes = bytes;
    }

    readBits(numBits: number): number {
        if (numBits < 1 || numBits > 32 || numBits > this.available()) {
            throw new Error(`Cannot read ${numBits.toString()} bits`);
        }

        let result = 0;
        // First, scan remainder from current byte
        if (this.bitOffset > 0) {
            let bitsLeft = 8 - this.bitOffset;
            let toRead = numBits < bitsLeft ? numBits : bitsLeft;
            let bitsToNotRead = bitsLeft - toRead;
            let mask = (0xFF >> (8 - toRead)) << bitsToNotRead;
            result = (this.bytes[this.byteOffset] & mask) >> bitsToNotRead;
            numBits -= toRead;
            this.bitOffset += toRead;
            if (this.bitOffset === 8) {
                this.bitOffset = 0;
                this.byteOffset++;
            }
        }
        // Next scan whole bytes
        if (numBits > 0) {
            while (numBits >= 8) {
                result = (result << 8) | (this.bytes[this.byteOffset] & 0xFF);
                this.byteOffset++;
                numBits -= 8;
            }
            // Finally scan a partial byte
            if (numBits > 0) {
                let bitsToNotRead = 8 - numBits;
                let mask = (0xFF >> bitsToNotRead) << bitsToNotRead;
                result = (result << numBits) | ((this.bytes[this.byteOffset] & mask) >> bitsToNotRead);
                this.bitOffset += numBits;
            }
        }
        return result;
    }

    available(): number {
        return 8 * (this.bytes.length - this.byteOffset) - this.bitOffset;
    }
}
