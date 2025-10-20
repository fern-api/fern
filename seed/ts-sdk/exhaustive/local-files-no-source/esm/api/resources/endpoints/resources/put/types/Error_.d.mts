import type * as SeedExhaustive from "../../../../../index.mjs";
export interface Error_ {
    category: SeedExhaustive.endpoints.ErrorCategory;
    code: SeedExhaustive.endpoints.ErrorCode;
    detail?: string;
    field?: string;
}
