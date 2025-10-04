import * as SeedExhaustive from "../../../../../index.js";
export interface Error_ {
    category: SeedExhaustive.endpoints.ErrorCategory;
    code: SeedExhaustive.endpoints.ErrorCode;
    detail?: string;
    field?: string;
}
