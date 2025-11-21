import type * as core from "../../../../../../core/index.js";
import * as errors from "../../../../../../errors/index.js";
import type { NestedObjectWithOptionalField } from "../types/NestedObjectWithOptionalField.js";
export declare class NestedObjectWithOptionalFieldError extends errors.SeedExhaustiveError {
    constructor(body: NestedObjectWithOptionalField, rawResponse?: core.RawResponse);
}
