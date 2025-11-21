import type * as core from "../../../../../../core/index.js";
import * as errors from "../../../../../../errors/index.js";
import type { NestedObjectWithRequiredField } from "../types/NestedObjectWithRequiredField.js";
export declare class NestedObjectWithRequiredFieldError extends errors.SeedExhaustiveError {
    constructor(body: NestedObjectWithRequiredField, rawResponse?: core.RawResponse);
}
