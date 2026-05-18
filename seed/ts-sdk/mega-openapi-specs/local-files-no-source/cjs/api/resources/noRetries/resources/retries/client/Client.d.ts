import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.js";
import * as core from "../../../../../../core/index.js";
import type * as SeedApi from "../../../../../index.js";
export declare namespace RetriesClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class RetriesClient {
    protected readonly _options: NormalizedClientOptions<RetriesClient.Options>;
    constructor(options: RetriesClient.Options);
    /**
     * @param {RetriesClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.noRetries.retries.getUsers()
     */
    getUsers(requestOptions?: RetriesClient.RequestOptions): core.HttpResponsePromise<SeedApi.noRetries.User[]>;
    private __getUsers;
}
