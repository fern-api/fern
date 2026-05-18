import type * as SeedApi from "../../../index.mjs";
export interface Response extends SeedApi.responseProperty.WithMetadata, SeedApi.responseProperty.WithDocs {
    data: SeedApi.responseProperty.Movie;
}
