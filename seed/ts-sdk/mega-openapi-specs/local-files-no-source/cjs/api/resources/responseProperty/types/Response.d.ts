import type * as SeedApi from "../../../index.js";
export interface Response extends SeedApi.responseProperty.WithMetadata, SeedApi.responseProperty.WithDocs {
    data: SeedApi.responseProperty.Movie;
}
