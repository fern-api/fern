import type * as SeedExhaustive from "../../../../../index.mjs";
export interface PaginatedResponse {
    items: SeedExhaustive.types.ObjectWithRequiredField[];
    next?: string | undefined;
}
