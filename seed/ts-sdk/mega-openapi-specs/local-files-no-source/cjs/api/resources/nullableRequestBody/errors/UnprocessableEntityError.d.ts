import type * as core from "../../../../core/index.js";
import * as errors from "../../../../errors/index.js";
import type * as SeedApi from "../../../index.js";
export declare class UnprocessableEntityError extends errors.SeedApiError {
    constructor(body: SeedApi.nullableRequestBody.PlainObject, rawResponse?: core.RawResponse);
}
