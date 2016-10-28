export declare class BitStream {
    private bytes;
    private byteOffset;
    private bitOffset;
    constructor(bytes: number[]);
    readBits(numBits: number): number;
    available(): number;
}
