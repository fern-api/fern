import type * as core from "../../../../../../core/index.mjs";
import * as errors from "../../../../../../errors/index.mjs";
import type * as SeedExhaustive from "../../../../../index.mjs";
export declare class ObjectWithRequiredFieldError extends errors.SeedExhaustiveError {
    readonly body: SeedExhaustive.types.ObjectWithRequiredField;
    constructor(body: SeedExhaustive.types.ObjectWithRequiredField, rawResponse?: core.RawResponse);
}
