import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.mjs";
import * as core from "../../../../../../core/index.mjs";
import type * as SeedApi from "../../../../../index.mjs";
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
