export interface PerspectiveTransform {
    a11: number;
    a21: number;
    a31: number;
    a12: number;
    a22: number;
    a32: number;
    a13: number;
    a23: number;
    a33: number;
}

function squareToQuadrilateral(x0: number, y0: number,
    x1: number, y1: number,
    x2: number, y2: number,
    x3: number, y3: number): PerspectiveTransform {
    let dx3 = x0 - x1 + x2 - x3;
    let dy3 = y0 - y1 + y2 - y3;
    if (dx3 === 0 && dy3 === 0) {
        // Affine
        return {
            a11: x1 - x0,
            a21: x2 - x1,
            a31: x0,
            a12: y1 - y0,
            a22: y2 - y1,
            a32: y0,
            a13: 0,
            a23: 0,
            a33: 1,
        };
    } else {
        let dx1 = x1 - x2;
        let dx2 = x3 - x2;
        let dy1 = y1 - y2;
        let dy2 = y3 - y2;
        let denominator = dx1 * dy2 - dx2 * dy1;
        let a13 = (dx3 * dy2 - dx2 * dy3) / denominator;
        let a23 = (dx1 * dy3 - dx3 * dy1) / denominator;
        return {
            a11: x1 - x0 + a13 * x1,
            a21: x3 - x0 + a23 * x3,
            a31: x0,
            a12: y1 - y0 + a13 * y1,
            a22: y3 - y0 + a23 * y3,
            a32: y0,
            a13: a13,
            a23: a23,
            a33: 1,
        };
    }
}

function buildAdjoint(i: PerspectiveTransform): PerspectiveTransform {
    return {
        a11: i.a22 * i.a33 - i.a23 * i.a32,
        a21: i.a23 * i.a31 - i.a21 * i.a33,
        a31: i.a21 * i.a32 - i.a22 * i.a31,
        a12: i.a13 * i.a32 - i.a12 * i.a33,
        a22: i.a11 * i.a33 - i.a13 * i.a31,
        a32: i.a12 * i.a31 - i.a11 * i.a32,
        a13: i.a12 * i.a23 - i.a13 * i.a22,
        a23: i.a13 * i.a21 - i.a11 * i.a23,
        a33: i.a11 * i.a22 - i.a12 * i.a21,
    };
}

function times(a: PerspectiveTransform, b: PerspectiveTransform): PerspectiveTransform {
    return {
        a11: a.a11 * b.a11 + a.a21 * b.a12 + a.a31 * b.a13,
        a21: a.a11 * b.a21 + a.a21 * b.a22 + a.a31 * b.a23,
        a31: a.a11 * b.a31 + a.a21 * b.a32 + a.a31 * b.a33,
        a12: a.a12 * b.a11 + a.a22 * b.a12 + a.a32 * b.a13,
        a22: a.a12 * b.a21 + a.a22 * b.a22 + a.a32 * b.a23,
        a32: a.a12 * b.a31 + a.a22 * b.a32 + a.a32 * b.a33,
        a13: a.a13 * b.a11 + a.a23 * b.a12 + a.a33 * b.a13,
        a23: a.a13 * b.a21 + a.a23 * b.a22 + a.a33 * b.a23,
        a33: a.a13 * b.a31 + a.a23 * b.a32 + a.a33 * b.a33,
    };
}

function quadrilateralToSquare(x0: number,
    y0: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x3: number,
    y3: number): PerspectiveTransform {
    // Here, the adjoint serves as the inverse:
    return buildAdjoint(squareToQuadrilateral(x0, y0, x1, y1, x2, y2, x3, y3));
}

export function transformPoints(transform: PerspectiveTransform, points: number[]): number[] {
    let max = points.length;
    let a11 = transform.a11;
    let a12 = transform.a12;
    let a13 = transform.a13;
    let a21 = transform.a21;
    let a22 = transform.a22;
    let a23 = transform.a23;
    let a31 = transform.a31;
    let a32 = transform.a32;
    let a33 = transform.a33;
    for (let i = 0; i < max; i += 2) {
        let x = points[i];
        let y = points[i + 1];
        let denominator = a13 * x + a23 * y + a33;
        points[i] = (a11 * x + a21 * y + a31) / denominator;
        points[i + 1] = (a12 * x + a22 * y + a32) / denominator;
    }
    return points;
}

export function quadrilateralToQuadrilateral(x0: number,
    y0: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x3: number,
    y3: number,
    x0p: number,
    y0p: number,
    x1p: number,
    y1p: number,
    x2p: number,
    y2p: number,
    x3p: number,
    y3p: number) {
    let qToS = quadrilateralToSquare(x0, y0, x1, y1, x2, y2, x3, y3);
    let sToQ = squareToQuadrilateral(x0p, y0p, x1p, y1p, x2p, y2p, x3p, y3p);
    return times(sToQ, qToS);
}
