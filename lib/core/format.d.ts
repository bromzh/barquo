export declare enum BarcodeType {
    LINEAR = 1,
    MATRIX = 2,
}
export interface BarcodeFormat {
    name: string;
    type: BarcodeType;
}
