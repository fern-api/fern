import type * as core from "../../../../../../core/index.mjs";
import * as errors from "../../../../../../errors/index.mjs";
import type * as SeedExhaustive from "../../../../../index.mjs";
export declare class NestedObjectWithRequiredFieldError extends errors.SeedExhaustiveError {
    readonly body: SeedExhaustive.types.NestedObjectWithRequiredField;
    constructor(body: SeedExhaustive.types.NestedObjectWithRequiredField, rawResponse?: core.RawResponse);
}
