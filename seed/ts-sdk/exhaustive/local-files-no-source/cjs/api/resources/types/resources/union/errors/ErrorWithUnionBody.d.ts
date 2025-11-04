import type * as core from "../../../../../../core/index.js";
import * as errors from "../../../../../../errors/index.js";
import type { Animal } from "../types/Animal.js";
export declare class ErrorWithUnionBody extends errors.SeedExhaustiveError {
    constructor(body: Animal, rawResponse?: core.RawResponse);
}
