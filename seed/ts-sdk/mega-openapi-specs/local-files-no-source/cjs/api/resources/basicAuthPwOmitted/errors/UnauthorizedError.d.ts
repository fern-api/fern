import type * as core from "../../../../core/index.js";
import * as errors from "../../../../errors/index.js";
export declare class UnauthorizedError extends errors.SeedApiError {
    constructor(body?: unknown, rawResponse?: core.RawResponse);
}
