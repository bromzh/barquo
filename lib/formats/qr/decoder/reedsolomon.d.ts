export declare class ReedSolomonDecoder {
    field: GenericGF;
    constructor();
    decode(received: number[], twoS: number): boolean;
    runEuclideanAlgorithm(a: GenericGFPoly, b: GenericGFPoly, R: number): GenericGFPoly[];
    findErrorLocations(errorLocator: GenericGFPoly): number[];
    findErrorMagnitudes(errorEvaluator: GenericGFPoly, errorLocations: number[]): number[];
}
export declare class GenericGFPoly {
    field: GenericGF;
    coefficients: number[];
    constructor(field: GenericGF, coefficients: number[]);
    evaluateAt(a: number): number;
    getCoefficient(degree: number): number;
    degree(): number;
    isZero(): boolean;
    addOrSubtract(other: GenericGFPoly): GenericGFPoly;
    multiply(scalar: number): GenericGFPoly;
    multiplyPoly(other: GenericGFPoly): GenericGFPoly;
    multiplyByMonomial(degree: number, coefficient: number): GenericGFPoly;
}
export declare class GenericGF {
    primitive: number;
    size: number;
    generatorBase: number;
    INITIALIZATION_THRESHOLD: number;
    expTable: number[];
    logTable: number[];
    zero: GenericGFPoly;
    one: GenericGFPoly;
    initialized: boolean;
    static addOrSubtract(a: number, b: number): number;
    constructor(primitive: number, size: number, genBase: number);
    multiply(a: number, b: number): number;
    exp(a: number): number;
    log(a: number): number;
    inverse(a: number): number;
    buildMonomial(degree: number, coefficient: number): GenericGFPoly;
    private initialize();
    private checkInit();
}
