import type * as SeedApi from "../index.js";
export interface EndpointsPaginatedResponse {
    items: SeedApi.TypesObjectWithRequiredField[];
    next?: (string | null) | undefined;
}
