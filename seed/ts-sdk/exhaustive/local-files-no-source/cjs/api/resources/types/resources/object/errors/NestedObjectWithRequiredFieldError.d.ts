import * as errors from "../../../../../../errors/index.js";
import * as SeedExhaustive from "../../../../../index.js";
import * as core from "../../../../../../core/index.js";
export declare class NestedObjectWithRequiredFieldError extends errors.SeedExhaustiveError {
    constructor(body: SeedExhaustive.types.NestedObjectWithRequiredField, rawResponse?: core.RawResponse);
}
