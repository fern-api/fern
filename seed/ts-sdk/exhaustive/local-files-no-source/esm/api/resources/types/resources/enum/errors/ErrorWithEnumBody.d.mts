import type * as core from "../../../../../../core/index.mjs";
import * as errors from "../../../../../../errors/index.mjs";
import type { WeatherReport } from "../types/WeatherReport.mjs";
export declare class ErrorWithEnumBody extends errors.SeedExhaustiveError {
    constructor(body: WeatherReport, rawResponse?: core.RawResponse);
}
