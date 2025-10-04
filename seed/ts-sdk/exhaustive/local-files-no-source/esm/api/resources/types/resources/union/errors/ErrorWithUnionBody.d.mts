import * as errors from "../../../../../../errors/index.mjs";
import * as SeedExhaustive from "../../../../../index.mjs";
import * as core from "../../../../../../core/index.mjs";
export declare class ErrorWithUnionBody extends errors.SeedExhaustiveError {
    constructor(body: SeedExhaustive.types.Animal, rawResponse?: core.RawResponse);
}
