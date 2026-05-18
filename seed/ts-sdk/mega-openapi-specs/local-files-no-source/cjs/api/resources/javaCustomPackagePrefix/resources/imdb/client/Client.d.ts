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
     * @param {SeedApi.javaCustomPackagePrefix.CreateMovieRequest} request
     * @param {ImdbClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.javaCustomPackagePrefix.imdb.createMovie({
     *         title: "title",
     *         rating: 1.1
     *     })
     */
    createMovie(request: SeedApi.javaCustomPackagePrefix.CreateMovieRequest, requestOptions?: ImdbClient.RequestOptions): core.HttpResponsePromise<SeedApi.javaCustomPackagePrefix.MovieId>;
    private __createMovie;
    /**
     * @param {SeedApi.javaCustomPackagePrefix.GetMovieImdbRequest} request
     * @param {ImdbClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @throws {@link SeedApi.javaCustomPackagePrefix.NotFoundError}
     *
     * @example
     *     await client.javaCustomPackagePrefix.imdb.getMovie({
     *         movieId: "movieId"
     *     })
     */
    getMovie(request: SeedApi.javaCustomPackagePrefix.GetMovieImdbRequest, requestOptions?: ImdbClient.RequestOptions): core.HttpResponsePromise<SeedApi.javaCustomPackagePrefix.Movie>;
    private __getMovie;
}
