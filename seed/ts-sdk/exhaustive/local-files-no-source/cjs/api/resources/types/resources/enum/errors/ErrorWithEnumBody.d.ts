import type * as core from "../../../../../../core/index.js";
import * as errors from "../../../../../../errors/index.js";
import type { WeatherReport } from "../types/WeatherReport.js";
export declare class ErrorWithEnumBody extends errors.SeedExhaustiveError {
    constructor(body: WeatherReport, rawResponse?: core.RawResponse);
}
