import type * as core from "../../../../../../core/index.js";
import * as errors from "../../../../../../errors/index.js";
import type * as SeedExhaustive from "../../../../../index.js";
export declare class ObjectWithOptionalFieldError extends errors.SeedExhaustiveError {
    readonly body: SeedExhaustive.types.ObjectWithOptionalField;
    constructor(body: SeedExhaustive.types.ObjectWithOptionalField, rawResponse?: core.RawResponse);
}
