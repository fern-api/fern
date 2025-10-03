import * as errors from "../../../../../../errors/index.js";
import * as SeedExhaustive from "../../../../../index.js";
import * as core from "../../../../../../core/index.js";
export declare class ObjectWithOptionalFieldError extends errors.SeedExhaustiveError {
    constructor(body: SeedExhaustive.types.ObjectWithOptionalField, rawResponse?: core.RawResponse);
}
