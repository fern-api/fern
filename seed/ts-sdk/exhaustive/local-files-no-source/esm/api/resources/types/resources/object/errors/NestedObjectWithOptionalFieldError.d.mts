import type * as core from "../../../../../../core/index.mjs";
import * as errors from "../../../../../../errors/index.mjs";
import type * as SeedExhaustive from "../../../../../index.mjs";
export declare class NestedObjectWithOptionalFieldError extends errors.SeedExhaustiveError {
    readonly body: SeedExhaustive.types.NestedObjectWithOptionalField;
    constructor(body: SeedExhaustive.types.NestedObjectWithOptionalField, rawResponse?: core.RawResponse);
}
