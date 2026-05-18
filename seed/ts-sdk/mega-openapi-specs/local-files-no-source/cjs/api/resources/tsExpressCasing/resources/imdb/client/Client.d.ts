import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.js";
import * as core from "../../../../../../core/index.js";
import * as SeedApi from "../../../../../index.js";
export declare namespace ImdbClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class ImdbClient {
    protected readonly _options: NormalizedClientOptions<ImdbClient.Options>;
    constructor(options: ImdbClient.Options);
    /**
     * Add a movie to the database
     *
     * @param {SeedApi.tsExpressCasing.CreateMovieImdbRequest} request
     * @param {ImdbClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.tsExpressCasing.imdb.createMovie({
     *         id: "id",
     *         movie_title: "movie_title",
     *         movie_rating: 1.1
     *     })
     */
    createMovie(request: SeedApi.tsExpressCasing.CreateMovieImdbRequest, requestOptions?: ImdbClient.RequestOptions): core.HttpResponsePromise<SeedApi.tsExpressCasing.MovieId>;
    private __createMovie;
    /**
     * @param {SeedApi.tsExpressCasing.GetMovieImdbRequest} request
     * @param {ImdbClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @throws {@link SeedApi.tsExpressCasing.NotFoundError}
     *
     * @example
     *     await client.tsExpressCasing.imdb.getMovie({
     *         movie_id: "movie_id"
     *     })
     */
    getMovie(request: SeedApi.tsExpressCasing.GetMovieImdbRequest, requestOptions?: ImdbClient.RequestOptions): core.HttpResponsePromise<SeedApi.tsExpressCasing.Movie>;
    private __getMovie;
}
