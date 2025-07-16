export class LoggableFernCliError extends Error {
    constructor(public readonly log: string) {
        super()
        Object.setPrototypeOf(this, LoggableFernCliError.prototype)
    }
}
