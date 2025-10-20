import type * as core from "../../../../core/index.mjs";
import * as errors from "../../../../errors/index.mjs";
import type * as SeedExhaustive from "../../../index.mjs";
export declare class BadRequestBody extends errors.SeedExhaustiveError {
    constructor(body: SeedExhaustive.BadObjectRequestInfo, rawResponse?: core.RawResponse);
}
