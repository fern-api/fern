import type * as SeedApi from "../../../index.mjs";
export interface SearchResponse {
    results: SeedApi.clientSideParams.Resource[];
    total?: (number | null) | undefined;
    next_offset?: (number | null) | undefined;
}
