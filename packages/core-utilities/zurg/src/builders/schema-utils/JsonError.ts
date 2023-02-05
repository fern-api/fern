import { ValidationError } from "../../Schema";

export class JsonError extends Error {
    constructor(public readonly errors: ValidationError[]) {
        super();
        Object.setPrototypeOf(this, JsonError.prototype);
    }
}
