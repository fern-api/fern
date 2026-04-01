export class LoggableFernCliError extends Error {
    public constructor(public readonly log: string) {
        super();
        Object.setPrototypeOf(this, LoggableFernCliError.prototype);
    }
}
