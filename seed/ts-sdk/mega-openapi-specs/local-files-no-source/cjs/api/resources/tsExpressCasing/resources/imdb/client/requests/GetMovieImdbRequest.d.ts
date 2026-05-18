import type * as SeedApi from "../../../../../../index.js";
/**
 * @example
 *     {
 *         movie_id: "movie_id"
 *     }
 */
export interface GetMovieImdbRequest {
    movie_id: SeedApi.tsExpressCasing.MovieId;
}
