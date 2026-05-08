import type * as core from "../../core/index.mjs";
import * as errors from "../../errors/index.mjs";
import type * as SeedApi from "../index.mjs";
export declare class BadRequestError extends errors.SeedApiError {
    constructor(body: SeedApi.BadObjectRequestInfo, rawResponse?: core.RawResponse);
}
