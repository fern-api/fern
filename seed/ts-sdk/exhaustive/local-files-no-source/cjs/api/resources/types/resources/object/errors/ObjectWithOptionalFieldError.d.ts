import type * as core from "../../../../../../core/index.js";
import * as errors from "../../../../../../errors/index.js";
import type { ObjectWithOptionalField } from "../types/ObjectWithOptionalField.js";
export declare class ObjectWithOptionalFieldError extends errors.SeedExhaustiveError {
    constructor(body: ObjectWithOptionalField, rawResponse?: core.RawResponse);
}
