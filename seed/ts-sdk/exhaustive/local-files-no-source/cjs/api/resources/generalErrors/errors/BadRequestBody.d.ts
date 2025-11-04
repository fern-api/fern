import type * as core from "../../../../core/index.js";
import * as errors from "../../../../errors/index.js";
import type { BadObjectRequestInfo } from "../types/BadObjectRequestInfo.js";
export declare class BadRequestBody extends errors.SeedExhaustiveError {
    constructor(body: BadObjectRequestInfo, rawResponse?: core.RawResponse);
}
