import type * as SeedApi from "../../../../../../index.js";
/**
 * @example
 *     {
 *         id: "id",
 *         movie_title: "movie_title",
 *         movie_rating: 1.1
 *     }
 */
export interface CreateMovieImdbRequest {
    id: SeedApi.tsExpressCasing.MovieId;
    movie_title: string;
    /** The rating scale is one to five stars */
    movie_rating: number;
}
