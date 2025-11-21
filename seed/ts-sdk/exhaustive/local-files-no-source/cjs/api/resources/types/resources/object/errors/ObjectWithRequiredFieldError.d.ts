import type * as core from "../../../../../../core/index.js";
import * as errors from "../../../../../../errors/index.js";
import type { ObjectWithRequiredField } from "../types/ObjectWithRequiredField.js";
export declare class ObjectWithRequiredFieldError extends errors.SeedExhaustiveError {
    constructor(body: ObjectWithRequiredField, rawResponse?: core.RawResponse);
}
