interface BaseErrorConstructor<T extends BaseError> {
    new (...args: any[]): T;
    prototype: Error;
}

function error<T extends BaseError>(): ClassDecorator {
    function errorDecorator(target: BaseErrorConstructor<T>): void {
        target.prototype = new Error();
        target.prototype.name = target.name;
        target.prototype.constructor = target;
    }

    return errorDecorator;
}

export class BaseError implements Error {
    name: string;
    message: string;
    stack: string;

    constructor(message?: string) {
        this.message = message;
        if (!(Error as any).captureStackTrace) {
            this.stack = (new Error()).stack;
        // } else {
            // (Error as any).captureStackTrace(this, this.constructor);
        }
    }
}

/**
 * NotFoundError
 */
@error()
export class NotFoundError extends BaseError { }
