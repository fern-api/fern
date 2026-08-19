import type * as core from "../../../../../../core/index.js";
import * as errors from "../../../../../../errors/index.js";
import type * as SeedExhaustive from "../../../../../index.js";
export declare class ErrorWithUnionBody extends errors.SeedExhaustiveError {
    readonly body: SeedExhaustive.types.Animal;
    constructor(body: SeedExhaustive.types.Animal, rawResponse?: core.RawResponse);
}
