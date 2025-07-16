export class FernCliError extends Error {
    constructor() {
        super()
        Object.setPrototypeOf(this, FernCliError.prototype)
    }
}
