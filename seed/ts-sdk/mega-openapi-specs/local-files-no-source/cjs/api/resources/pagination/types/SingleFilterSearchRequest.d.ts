import type * as SeedApi from "../../../index.js";
export interface SingleFilterSearchRequest {
    field?: (string | null) | undefined;
    operator?: (SeedApi.pagination.SingleFilterSearchRequestOperator | null) | undefined;
    value?: (string | null) | undefined;
}
