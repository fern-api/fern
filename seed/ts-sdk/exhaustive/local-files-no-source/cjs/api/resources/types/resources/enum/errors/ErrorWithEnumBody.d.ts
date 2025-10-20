import type * as core from "../../../../../../core/index.js";
import * as errors from "../../../../../../errors/index.js";
import type * as SeedExhaustive from "../../../../../index.js";
export declare class ErrorWithEnumBody extends errors.SeedExhaustiveError {
    constructor(body: SeedExhaustive.types.WeatherReport, rawResponse?: core.RawResponse);
}
