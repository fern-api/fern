import type * as SeedApi from "../../../index.mjs";
export interface ExtendedMovie extends SeedApi.examples.Movie {
    cast: string[];
}
