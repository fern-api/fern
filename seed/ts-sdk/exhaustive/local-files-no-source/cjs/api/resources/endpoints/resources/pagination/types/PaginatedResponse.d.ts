import type * as SeedExhaustive from "../../../../../index.js";
export interface PaginatedResponse {
    items: SeedExhaustive.types.ObjectWithRequiredField[];
    next?: string | undefined;
}
