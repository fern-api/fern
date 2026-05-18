import type * as core from "../../../../core/index.mjs";
import * as errors from "../../../../errors/index.mjs";
export declare class UnauthorizedError extends errors.SeedApiError {
    constructor(body?: unknown, rawResponse?: core.RawResponse);
}
