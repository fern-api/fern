import type * as SeedApi from "../../../../../../index.js";
/**
 * @example
 *     {
 *         movieId: "movieId"
 *     }
 */
export interface GetMovieImdbRequest {
    movieId: SeedApi.imdb.MovieId;
}
