import type * as SeedApi from "../../../index.js";
export interface ExtendedMovie extends SeedApi.examples.Movie {
    cast: string[];
}
