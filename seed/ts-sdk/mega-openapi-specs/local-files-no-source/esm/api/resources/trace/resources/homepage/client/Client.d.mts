import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.mjs";
import * as core from "../../../../../../core/index.mjs";
import type * as SeedApi from "../../../../../index.mjs";
export declare namespace HomepageClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class HomepageClient {
    protected readonly _options: NormalizedClientOptions<HomepageClient.Options>;
    constructor(options: HomepageClient.Options);
    /**
     * @param {HomepageClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.trace.homepage.getHomepageProblems()
     */
    getHomepageProblems(requestOptions?: HomepageClient.RequestOptions): core.HttpResponsePromise<SeedApi.trace.ProblemId[]>;
    private __getHomepageProblems;
    /**
     * @param {SeedApi.trace.ProblemId[]} request
     * @param {HomepageClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.trace.homepage.setHomepageProblems(["string"])
     */
    setHomepageProblems(request: SeedApi.trace.ProblemId[], requestOptions?: HomepageClient.RequestOptions): core.HttpResponsePromise<void>;
    private __setHomepageProblems;
}
