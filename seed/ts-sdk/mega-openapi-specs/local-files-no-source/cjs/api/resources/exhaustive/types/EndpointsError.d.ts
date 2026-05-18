import type * as SeedApi from "../../../index.js";
export interface EndpointsError {
    category: SeedApi.exhaustive.EndpointsErrorCategory;
    code: SeedApi.exhaustive.EndpointsErrorCode;
    detail?: (string | null) | undefined;
    field?: (string | null) | undefined;
}
