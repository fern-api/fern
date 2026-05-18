import type * as SeedApi from "../../../index.mjs";
export interface Movie {
    id: SeedApi.imdb.MovieId;
    title: string;
    /** The rating scale is one to five stars */
    rating: number;
}
