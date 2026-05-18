import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.mjs";
import * as core from "../../../../../../core/index.mjs";
import type * as SeedApi from "../../../../../index.mjs";
export declare namespace ServiceClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class ServiceClient {
    protected readonly _options: NormalizedClientOptions<ServiceClient.Options>;
    constructor(options: ServiceClient.Options);
    /**
     * @param {SeedApi.examples.GetMovieServiceRequest} request
     * @param {ServiceClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.examples.service.getMovie({
     *         movieId: "movieId"
     *     })
     */
    getMovie(request: SeedApi.examples.GetMovieServiceRequest, requestOptions?: ServiceClient.RequestOptions): core.HttpResponsePromise<SeedApi.examples.Movie>;
    private __getMovie;
    /**
     * @param {SeedApi.examples.Movie} request
     * @param {ServiceClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.examples.service.createMovie({
     *         id: "movie-c06a4ad7",
     *         prequel: "movie-cv9b914f",
     *         title: "The Boy and the Heron",
     *         from: "Hayao Miyazaki",
     *         rating: 8,
     *         type: "movie",
     *         tag: "tag-wf9as23d",
     *         metadata: {
     *             "actors": [
     *                 "Christian Bale",
     *                 "Florence Pugh",
     *                 "Willem Dafoe"
     *             ],
     *             "releaseDate": "2023-12-08",
     *             "ratings": {
     *                 "rottenTomatoes": 97,
     *                 "imdb": 7.6
     *             }
     *         },
     *         revenue: 1000000
     *     })
     */
    createMovie(request: SeedApi.examples.Movie, requestOptions?: ServiceClient.RequestOptions): core.HttpResponsePromise<SeedApi.examples.MovieId>;
    private __createMovie;
    /**
     * @param {SeedApi.examples.GetMetadataServiceRequest} request
     * @param {ServiceClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.examples.service.getMetadata()
     */
    getMetadata(request?: SeedApi.examples.GetMetadataServiceRequest, requestOptions?: ServiceClient.RequestOptions): core.HttpResponsePromise<SeedApi.examples.Metadata>;
    private __getMetadata;
    /**
     * @param {SeedApi.examples.BigEntity} request
     * @param {ServiceClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.examples.service.createBigEntity()
     */
    createBigEntity(request?: SeedApi.examples.BigEntity, requestOptions?: ServiceClient.RequestOptions): core.HttpResponsePromise<SeedApi.examples.Response>;
    private __createBigEntity;
    /**
     * @param {SeedApi.examples.RefreshTokenRequest | null} request
     * @param {ServiceClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.examples.service.refreshToken({
     *         ttl: 1
     *     })
     *
     * @example
     *     await client.examples.service.refreshToken({
     *         ttl: 420
     *     })
     */
    refreshToken(request: SeedApi.examples.RefreshTokenRequest | null, requestOptions?: ServiceClient.RequestOptions): core.HttpResponsePromise<void>;
    private __refreshToken;
}
