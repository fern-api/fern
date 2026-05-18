import type * as SeedApi from "../../../index.mjs";
export interface EndpointsPaginatedResponse {
    items: SeedApi.exhaustive.TypesObjectWithRequiredField[];
    next?: (string | null) | undefined;
}
