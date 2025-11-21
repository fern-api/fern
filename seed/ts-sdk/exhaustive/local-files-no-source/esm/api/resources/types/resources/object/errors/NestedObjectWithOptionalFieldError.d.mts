import type * as core from "../../../../../../core/index.mjs";
import * as errors from "../../../../../../errors/index.mjs";
import type { NestedObjectWithOptionalField } from "../types/NestedObjectWithOptionalField.mjs";
export declare class NestedObjectWithOptionalFieldError extends errors.SeedExhaustiveError {
    constructor(body: NestedObjectWithOptionalField, rawResponse?: core.RawResponse);
}
