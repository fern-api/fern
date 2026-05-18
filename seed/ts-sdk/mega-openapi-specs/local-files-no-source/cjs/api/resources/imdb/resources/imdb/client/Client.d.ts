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
     * @beta This endpoint is in pre-release and may change.
     *
     * Add a movie to the database using the movies/* /... path.
     *
     * @param {SeedApi.imdb.CreateMovieRequest} request
     * @param {ImdbClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.imdb.imdb.createMovie({
     *         title: "title",
     *         rating: 1.1
     *     })
     */
    createMovie(request: SeedApi.imdb.CreateMovieRequest, requestOptions?: ImdbClient.RequestOptions): core.HttpResponsePromise<SeedApi.imdb.MovieId>;
    private __createMovie;
    /**
     * @deprecated
     *
     * @param {SeedApi.imdb.GetMovieImdbRequest} request
     * @param {ImdbClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @throws {@link SeedApi.imdb.NotFoundError}
     *
     * @example
     *     await client.imdb.imdb.getMovie({
     *         movieId: "movieId"
     *     })
     */
    getMovie(request: SeedApi.imdb.GetMovieImdbRequest, requestOptions?: ImdbClient.RequestOptions): core.HttpResponsePromise<SeedApi.imdb.Movie>;
    private __getMovie;
}
