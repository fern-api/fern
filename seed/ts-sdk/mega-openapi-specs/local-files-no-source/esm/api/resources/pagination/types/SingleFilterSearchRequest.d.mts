import type * as SeedApi from "../../../index.mjs";
export interface SingleFilterSearchRequest {
    field?: (string | null) | undefined;
    operator?: (SeedApi.pagination.SingleFilterSearchRequestOperator | null) | undefined;
    value?: (string | null) | undefined;
}
