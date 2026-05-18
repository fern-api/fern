import type * as SeedApi from "../../../index.js";
export interface MultipleFilterSearchRequest {
    operator?: (SeedApi.pagination.MultipleFilterSearchRequestOperator | null) | undefined;
    value?: (SeedApi.pagination.MultipleFilterSearchRequestValue | null) | undefined;
}
