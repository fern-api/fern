import type * as core from "../../../../../../core/index.mjs";
import * as errors from "../../../../../../errors/index.mjs";
import type { NestedObjectWithRequiredField } from "../types/NestedObjectWithRequiredField.mjs";
export declare class NestedObjectWithRequiredFieldError extends errors.SeedExhaustiveError {
    constructor(body: NestedObjectWithRequiredField, rawResponse?: core.RawResponse);
}
