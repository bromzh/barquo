export enum BarcodeType {
    LINEAR = 1,
    MATRIX
}

export interface BarcodeFormat {
    name: string;
    type: BarcodeType;
}