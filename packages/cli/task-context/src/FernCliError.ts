export class FernCliError extends Error {
    constructor(message?: string) {
        super(message);
        Object.setPrototypeOf(this, FernCliError.prototype);
    }
}
