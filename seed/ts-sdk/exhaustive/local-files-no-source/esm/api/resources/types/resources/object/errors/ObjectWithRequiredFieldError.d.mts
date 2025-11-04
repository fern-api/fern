import type * as core from "../../../../../../core/index.mjs";
import * as errors from "../../../../../../errors/index.mjs";
import type { ObjectWithRequiredField } from "../types/ObjectWithRequiredField.mjs";
export declare class ObjectWithRequiredFieldError extends errors.SeedExhaustiveError {
    constructor(body: ObjectWithRequiredField, rawResponse?: core.RawResponse);
}
