import type * as SeedApi from "../../../../../../index.mjs";
/**
 * @example
 *     {
 *         movieId: "movieId"
 *     }
 */
export interface GetMovieImdbRequest {
    movieId: SeedApi.imdb.MovieId;
}
