import type * as core from "../../../../core/index.js";
import * as errors from "../../../../errors/index.js";
import type * as SeedExhaustive from "../../../index.js";
export declare class BadRequestBody extends errors.SeedExhaustiveError {
    readonly body: SeedExhaustive.BadObjectRequestInfo;
    constructor(body: SeedExhaustive.BadObjectRequestInfo, rawResponse?: core.RawResponse);
}
