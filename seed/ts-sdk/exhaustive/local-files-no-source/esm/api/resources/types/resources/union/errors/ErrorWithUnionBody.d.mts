import type * as core from "../../../../../../core/index.mjs";
import * as errors from "../../../../../../errors/index.mjs";
import type { Animal } from "../types/Animal.mjs";
export declare class ErrorWithUnionBody extends errors.SeedExhaustiveError {
    constructor(body: Animal, rawResponse?: core.RawResponse);
}
