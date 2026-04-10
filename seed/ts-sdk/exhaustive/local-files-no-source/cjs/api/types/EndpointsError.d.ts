import type * as SeedApi from "../index.js";
export interface EndpointsError {
    category: SeedApi.EndpointsErrorCategory;
    code: SeedApi.EndpointsErrorCode;
    detail?: (string | null) | undefined;
    field?: (string | null) | undefined;
}
