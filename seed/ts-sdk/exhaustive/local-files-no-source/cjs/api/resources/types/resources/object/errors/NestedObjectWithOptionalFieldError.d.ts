import type * as core from "../../../../../../core/index.js";
import * as errors from "../../../../../../errors/index.js";
import type * as SeedExhaustive from "../../../../../index.js";
export declare class NestedObjectWithOptionalFieldError extends errors.SeedExhaustiveError {
    readonly body: SeedExhaustive.types.NestedObjectWithOptionalField;
    constructor(body: SeedExhaustive.types.NestedObjectWithOptionalField, rawResponse?: core.RawResponse);
}
