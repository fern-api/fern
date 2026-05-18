import type * as core from "../../../../core/index.mjs";
import * as errors from "../../../../errors/index.mjs";
import type * as SeedApi from "../../../index.mjs";
export declare class InternalServerError extends errors.SeedApiError {
    constructor(body: SeedApi.errors.ErrorBody, rawResponse?: core.RawResponse);
}
