import { ValidationError } from "../../Schema";

export class ParseError extends Error {
    constructor(public readonly errors: ValidationError[]) {
        super();
        Object.setPrototypeOf(this, ParseError.prototype);
    }
}
