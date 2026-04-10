import type * as SeedApi from "../index.mjs";
export interface EndpointsPaginatedResponse {
    items: SeedApi.TypesObjectWithRequiredField[];
    next?: (string | null) | undefined;
}
