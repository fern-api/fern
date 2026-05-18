import type * as SeedApi from "../../../index.mjs";
export interface EndpointsPaginatedResponse {
    items: SeedApi.goDeterministicOrdering.TypesObjectWithRequiredField[];
    next?: (string | null) | undefined;
}
