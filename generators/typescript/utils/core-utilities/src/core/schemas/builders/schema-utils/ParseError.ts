import type { ValidationError } from "../../Schema";
import { stringifyValidationError } from "./stringifyValidationErrors";

export class ParseError extends Error {
    constructor(public readonly errors: ValidationError[]) {
        super(errors.map(stringifyValidationError).join("; "));
        this.name = "ParseError";
        Object.setPrototypeOf(this, ParseError.prototype);
    }
}
