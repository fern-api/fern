export class FernCliError extends Error {
    public constructor() {
        super();
        Object.setPrototypeOf(this, FernCliError.prototype);
    }
}
