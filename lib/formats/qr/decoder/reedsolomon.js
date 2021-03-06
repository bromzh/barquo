export var ReedSolomonDecoder = (function () {
    function ReedSolomonDecoder() {
        this.field = new GenericGF(0x011D, 256, 0); // x^8 + x^4 + x^3 + x^2 + 1
    }
    ReedSolomonDecoder.prototype.decode = function (received, twoS) {
        var poly = new GenericGFPoly(this.field, received);
        var syndromeCoefficients = new Array(twoS);
        var noError = true;
        for (var i = 0; i < twoS; i++) {
            var evaluation = poly.evaluateAt(this.field.exp(i + this.field.generatorBase));
            syndromeCoefficients[syndromeCoefficients.length - 1 - i] = evaluation;
            if (evaluation !== 0) {
                noError = false;
            }
        }
        if (noError) {
            return true;
        }
        var syndrome = new GenericGFPoly(this.field, syndromeCoefficients);
        var sigmaOmega = this.runEuclideanAlgorithm(this.field.buildMonomial(twoS, 1), syndrome, twoS);
        if (sigmaOmega == null)
            return false;
        var sigma = sigmaOmega[0];
        var errorLocations = this.findErrorLocations(sigma);
        if (errorLocations == null)
            return false;
        var omega = sigmaOmega[1];
        var errorMagnitudes = this.findErrorMagnitudes(omega, errorLocations);
        for (var i = 0; i < errorLocations.length; i++) {
            var position = received.length - 1 - this.field.log(errorLocations[i]);
            if (position < 0) {
                // throw new ReedSolomonException("Bad error location");
                return false;
            }
            received[position] = GenericGF.addOrSubtract(received[position], errorMagnitudes[i]);
        }
        return true;
    };
    ReedSolomonDecoder.prototype.runEuclideanAlgorithm = function (a, b, R) {
        // Assume a's degree is >= b's
        if (a.degree() < b.degree()) {
            var temp = a;
            a = b;
            b = temp;
        }
        var rLast = a;
        var r = b;
        var tLast = this.field.zero;
        var t = this.field.one;
        // Run Euclidean algorithm until r's degree is less than R/2
        while (r.degree() >= R / 2) {
            var rLastLast = rLast;
            var tLastLast = tLast;
            rLast = r;
            tLast = t;
            // Divide rLastLast by rLast, with quotient in q and remainder in r
            if (rLast.isZero()) {
                // Oops, Euclidean algorithm already terminated?
                // throw new ReedSolomonException("r_{i-1} was zero");
                return null;
            }
            r = rLastLast;
            var q = this.field.zero;
            var denominatorLeadingTerm = rLast.getCoefficient(rLast.degree());
            var dltInverse = this.field.inverse(denominatorLeadingTerm);
            while (r.degree() >= rLast.degree() && !r.isZero()) {
                var degreeDiff = r.degree() - rLast.degree();
                var scale = this.field.multiply(r.getCoefficient(r.degree()), dltInverse);
                q = q.addOrSubtract(this.field.buildMonomial(degreeDiff, scale));
                r = r.addOrSubtract(rLast.multiplyByMonomial(degreeDiff, scale));
            }
            t = q.multiplyPoly(tLast).addOrSubtract(tLastLast);
            if (r.degree() >= rLast.degree()) {
                // throw new IllegalStateException("Division algorithm failed to reduce polynomial?");
                return null;
            }
        }
        var sigmaTildeAtZero = t.getCoefficient(0);
        if (sigmaTildeAtZero === 0) {
            // throw new ReedSolomonException("sigmaTilde(0) was zero");
            return null;
        }
        var inverse = this.field.inverse(sigmaTildeAtZero);
        var sigma = t.multiply(inverse);
        var omega = r.multiply(inverse);
        return [sigma, omega];
    };
    ReedSolomonDecoder.prototype.findErrorLocations = function (errorLocator) {
        // This is a direct application of Chien's search
        var numErrors = errorLocator.degree();
        if (numErrors === 1) {
            // shortcut
            return [errorLocator.getCoefficient(1)];
        }
        var result = new Array(numErrors);
        var e = 0;
        for (var i = 1; i < this.field.size && e < numErrors; i++) {
            if (errorLocator.evaluateAt(i) === 0) {
                result[e] = this.field.inverse(i);
                e++;
            }
        }
        if (e !== numErrors) {
            // throw new ReedSolomonException("Error locator degree does not match number of roots");
            return null;
        }
        return result;
    };
    ReedSolomonDecoder.prototype.findErrorMagnitudes = function (errorEvaluator, errorLocations) {
        // This is directly applying Forney's Formula
        var s = errorLocations.length;
        var result = new Array(s);
        for (var i = 0; i < s; i++) {
            var xiInverse = this.field.inverse(errorLocations[i]);
            var denominator = 1;
            for (var j = 0; j < s; j++) {
                if (i !== j) {
                    // denominator = field.multiply(denominator,
                    //    GenericGF.addOrSubtract(1, field.multiply(errorLocations[j], xiInverse)));
                    // Above should work but fails on some Apple and Linux JDKs due to a Hotspot bug.
                    // Below is a funny-looking workaround from Steven Parkes
                    var term = this.field.multiply(errorLocations[j], xiInverse);
                    var termPlus1 = (term & 0x1) === 0 ? term | 1 : term & ~1;
                    denominator = this.field.multiply(denominator, termPlus1);
                }
            }
            result[i] = this.field.multiply(errorEvaluator.evaluateAt(xiInverse), this.field.inverse(denominator));
            if (this.field.generatorBase !== 0) {
                result[i] = this.field.multiply(result[i], xiInverse);
            }
        }
        return result;
    };
    return ReedSolomonDecoder;
}());
export var GenericGFPoly = (function () {
    function GenericGFPoly(field, coefficients) {
        if (coefficients.length === 0) {
            throw new Error('No coefficients.');
        }
        this.field = field;
        var coefficientsLength = coefficients.length;
        if (coefficientsLength > 1 && coefficients[0] === 0) {
            // Leading term must be non-zero for anything except the constant polynomial "0"
            var firstNonZero = 1;
            while (firstNonZero < coefficientsLength && coefficients[firstNonZero] === 0) {
                firstNonZero++;
            }
            if (firstNonZero === coefficientsLength) {
                this.coefficients = field.zero.coefficients;
            }
            else {
                this.coefficients = new Array(coefficientsLength - firstNonZero);
                /*Array.Copy(coefficients,       // Source array
                 firstNonZero,              // Source index
                 this.coefficients,         // Destination array
                 0,                         // Destination index
                 this.coefficients.length); // length*/
                for (var i = 0; i < this.coefficients.length; i++) {
                    this.coefficients[i] = coefficients[firstNonZero + i];
                }
            }
        }
        else {
            this.coefficients = coefficients;
        }
    }
    GenericGFPoly.prototype.evaluateAt = function (a) {
        var result = 0;
        if (a === 0) {
            // Just return the x^0 coefficient
            return this.getCoefficient(0);
        }
        var size = this.coefficients.length;
        if (a === 1) {
            // Just the sum of the coefficients
            this.coefficients.forEach(function (coefficient) {
                result = GenericGF.addOrSubtract(result, coefficient);
            });
            return result;
        }
        result = this.coefficients[0];
        for (var i = 1; i < size; i++) {
            result = GenericGF.addOrSubtract(this.field.multiply(a, result), this.coefficients[i]);
        }
        return result;
    };
    GenericGFPoly.prototype.getCoefficient = function (degree) {
        return this.coefficients[this.coefficients.length - 1 - degree];
    };
    GenericGFPoly.prototype.degree = function () {
        return this.coefficients.length - 1;
    };
    GenericGFPoly.prototype.isZero = function () {
        return this.coefficients[0] === 0;
    };
    GenericGFPoly.prototype.addOrSubtract = function (other) {
        /* TODO, fix this.
         if (!this.field.Equals(other.field))
         {
         throw new Error("GenericGFPolys do not have same GenericGF field");
         }*/
        if (this.isZero()) {
            return other;
        }
        if (other.isZero()) {
            return this;
        }
        var smallerCoefficients = this.coefficients;
        var largerCoefficients = other.coefficients;
        if (smallerCoefficients.length > largerCoefficients.length) {
            var temp = smallerCoefficients;
            smallerCoefficients = largerCoefficients;
            largerCoefficients = temp;
        }
        var sumDiff = new Array(largerCoefficients.length);
        var lengthDiff = largerCoefficients.length - smallerCoefficients.length;
        // Copy high-order terms only found in higher-degree polynomial's coefficients
        ///Array.Copy(largerCoefficients, 0, sumDiff, 0, lengthDiff);
        for (var i = 0; i < lengthDiff; i++) {
            sumDiff[i] = largerCoefficients[i];
        }
        for (var i = lengthDiff; i < largerCoefficients.length; i++) {
            sumDiff[i] = GenericGF.addOrSubtract(smallerCoefficients[i - lengthDiff], largerCoefficients[i]);
        }
        return new GenericGFPoly(this.field, sumDiff);
    };
    GenericGFPoly.prototype.multiply = function (scalar) {
        if (scalar === 0) {
            return this.field.zero;
        }
        if (scalar === 1) {
            return this;
        }
        var size = this.coefficients.length;
        var product = new Array(size);
        for (var i = 0; i < size; i++) {
            product[i] = this.field.multiply(this.coefficients[i], scalar);
        }
        return new GenericGFPoly(this.field, product);
    };
    GenericGFPoly.prototype.multiplyPoly = function (other) {
        /* TODO Fix this.
         if (!field.Equals(other.field))
         {
         throw new Error("GenericGFPolys do not have same GenericGF field");
         }*/
        if (this.isZero() || other.isZero()) {
            return this.field.zero;
        }
        var aCoefficients = this.coefficients;
        var aLength = aCoefficients.length;
        var bCoefficients = other.coefficients;
        var bLength = bCoefficients.length;
        var product = new Array(aLength + bLength - 1);
        for (var i = 0; i < aLength; i++) {
            var aCoeff = aCoefficients[i];
            for (var j = 0; j < bLength; j++) {
                product[i + j] = GenericGF.addOrSubtract(product[i + j], this.field.multiply(aCoeff, bCoefficients[j]));
            }
        }
        return new GenericGFPoly(this.field, product);
    };
    GenericGFPoly.prototype.multiplyByMonomial = function (degree, coefficient) {
        if (degree < 0) {
            throw new Error('Invalid degree less than 0');
        }
        if (coefficient === 0) {
            return this.field.zero;
        }
        var size = this.coefficients.length;
        var product = new Array(size + degree);
        for (var i = 0; i < size; i++) {
            product[i] = this.field.multiply(this.coefficients[i], coefficient);
        }
        return new GenericGFPoly(this.field, product);
    };
    return GenericGFPoly;
}());
export var GenericGF = (function () {
    function GenericGF(primitive, size, genBase) {
        // ok.
        this.INITIALIZATION_THRESHOLD = 0;
        this.initialized = false;
        this.primitive = primitive;
        this.size = size;
        this.generatorBase = genBase;
        if (size <= this.INITIALIZATION_THRESHOLD) {
            this.initialize();
        }
    }
    GenericGF.addOrSubtract = function (a, b) {
        return a ^ b;
    };
    GenericGF.prototype.multiply = function (a, b) {
        this.checkInit();
        if (a === 0 || b === 0) {
            return 0;
        }
        return this.expTable[(this.logTable[a] + this.logTable[b]) % (this.size - 1)];
    };
    GenericGF.prototype.exp = function (a) {
        this.checkInit();
        return this.expTable[a];
    };
    GenericGF.prototype.log = function (a) {
        this.checkInit();
        if (a === 0) {
            throw new Error("Can't take log(0)");
        }
        return this.logTable[a];
    };
    GenericGF.prototype.inverse = function (a) {
        this.checkInit();
        if (a === 0) {
            throw new Error("Can't invert 0");
        }
        return this.expTable[this.size - this.logTable[a] - 1];
    };
    GenericGF.prototype.buildMonomial = function (degree, coefficient) {
        this.checkInit();
        if (degree < 0) {
            throw new Error('Invalid monomial degree less than 0');
        }
        if (coefficient === 0) {
            return this.zero;
        }
        var coefficients = new Array(degree + 1);
        coefficients[0] = coefficient;
        return new GenericGFPoly(this, coefficients);
    };
    GenericGF.prototype.initialize = function () {
        this.expTable = new Array(this.size);
        this.logTable = new Array(this.size);
        var x = 1;
        for (var i = 0; i < this.size; i++) {
            this.expTable[i] = x;
            x <<= 1; // x = x * 2; we're assuming the generator alpha is 2
            if (x >= this.size) {
                x ^= this.primitive;
                x &= this.size - 1;
            }
        }
        for (var i = 0; i < this.size - 1; i++) {
            this.logTable[this.expTable[i]] = i;
        }
        // logTable[0] == 0 but this should never be used
        this.zero = new GenericGFPoly(this, [0]);
        this.one = new GenericGFPoly(this, [1]);
        this.initialized = true;
    };
    GenericGF.prototype.checkInit = function () {
        if (!this.initialized)
            this.initialize();
    };
    return GenericGF;
}());
//# sourceMappingURL=reedsolomon.js.map