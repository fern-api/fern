import type * as core from "../../../../core/index.mjs";
import * as errors from "../../../../errors/index.mjs";
import type * as SeedApi from "../../../index.mjs";
export declare class UnprocessableEntityError extends errors.SeedApiError {
    constructor(body: SeedApi.nullableRequestBody.PlainObject, rawResponse?: core.RawResponse);
}
