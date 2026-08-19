import type * as core from "../../../../../../core/index.mjs";
import * as errors from "../../../../../../errors/index.mjs";
import type * as SeedExhaustive from "../../../../../index.mjs";
export declare class ErrorWithUnionBody extends errors.SeedExhaustiveError {
    readonly body: SeedExhaustive.types.Animal;
    constructor(body: SeedExhaustive.types.Animal, rawResponse?: core.RawResponse);
}
