import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.js";
import * as core from "../../../../../../core/index.js";
import type * as SeedApi from "../../../../../index.js";
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
     * @param {SeedApi.goContentType.CreateMovieRequest} request
     * @param {ImdbClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.goContentType.imdb.createMovie({
     *         title: "title",
     *         rating: 1.1
     *     })
     */
    createMovie(request: SeedApi.goContentType.CreateMovieRequest, requestOptions?: ImdbClient.RequestOptions): core.HttpResponsePromise<string>;
    private __createMovie;
}
