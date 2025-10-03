import * as errors from "../../../../errors/index.js";
import * as SeedExhaustive from "../../../index.js";
import * as core from "../../../../core/index.js";
export declare class BadRequestBody extends errors.SeedExhaustiveError {
    constructor(body: SeedExhaustive.BadObjectRequestInfo, rawResponse?: core.RawResponse);
}
