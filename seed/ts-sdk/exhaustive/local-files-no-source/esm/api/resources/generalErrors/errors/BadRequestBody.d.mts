import type * as core from "../../../../core/index.mjs";
import * as errors from "../../../../errors/index.mjs";
import type { BadObjectRequestInfo } from "../types/BadObjectRequestInfo.mjs";
export declare class BadRequestBody extends errors.SeedExhaustiveError {
    constructor(body: BadObjectRequestInfo, rawResponse?: core.RawResponse);
}
