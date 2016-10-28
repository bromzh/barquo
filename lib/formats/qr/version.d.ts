export declare function numBitsDiffering(a: number, b: number): number;
export interface ErrorCorrectionLevel {
    ordinal: number;
    bits: number;
    name: string;
}
export declare class ECB {
    count: number;
    dataCodewords: number;
    constructor(_count: number, _dataCodewords: number);
}
export declare class ECBlocks {
    ecCodewordsPerBlock: number;
    ecBlocks: ECB[];
    constructor(_ecCodewordsPerBlock: number, ..._ecBlocks: ECB[]);
    getNumBlocks(): number;
    getTotalECCodewords(): number;
}
export declare class Version {
    versionNumber: number;
    alignmentPatternCenters: number[];
    ecBlocks: ECBlocks[];
    totalCodewords: number;
    static decodeVersionInformation(versionBits: number): Version;
    constructor(_versionNumber: number, _alignmentPatternCenters: number[], ..._ecBlocks: ECBlocks[]);
    getDimensionForVersion(): number;
    getECBlocksForLevel(ecLevel: ErrorCorrectionLevel): ECBlocks;
}
export declare function getVersionForNumber(versionNumber: number): Version;
