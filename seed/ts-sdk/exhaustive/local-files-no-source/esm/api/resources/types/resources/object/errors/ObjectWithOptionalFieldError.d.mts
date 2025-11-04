import type * as core from "../../../../../../core/index.mjs";
import * as errors from "../../../../../../errors/index.mjs";
import type { ObjectWithOptionalField } from "../types/ObjectWithOptionalField.mjs";
export declare class ObjectWithOptionalFieldError extends errors.SeedExhaustiveError {
    constructor(body: ObjectWithOptionalField, rawResponse?: core.RawResponse);
}
