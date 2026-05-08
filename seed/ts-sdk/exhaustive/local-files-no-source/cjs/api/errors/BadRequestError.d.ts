import type * as core from "../../core/index.js";
import * as errors from "../../errors/index.js";
import type * as SeedApi from "../index.js";
export declare class BadRequestError extends errors.SeedApiError {
    constructor(body: SeedApi.BadObjectRequestInfo, rawResponse?: core.RawResponse);
}
