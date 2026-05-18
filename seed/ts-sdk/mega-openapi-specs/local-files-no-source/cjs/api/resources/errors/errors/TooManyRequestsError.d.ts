import type * as core from "../../../../core/index.js";
import * as errors from "../../../../errors/index.js";
import type * as SeedApi from "../../../index.js";
export declare class TooManyRequestsError extends errors.SeedApiError {
    constructor(body: SeedApi.errors.ErrorBody, rawResponse?: core.RawResponse);
}
