import type * as SeedApi from "../../../index.js";
export interface EndpointsPaginatedResponse {
    items: SeedApi.exhaustive.TypesObjectWithRequiredField[];
    next?: (string | null) | undefined;
}
