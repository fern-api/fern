import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.js";
import { type NormalizedClientOptionsWithAuth } from "../../../../../../BaseClient.js";
import * as core from "../../../../../../core/index.js";
import type * as SeedApi from "../../../../../index.js";
export declare namespace UserClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class UserClient {
    protected readonly _options: NormalizedClientOptionsWithAuth<UserClient.Options>;
    constructor(options: UserClient.Options);
    /**
     * @param {UserClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.anyAuth.user.get()
     */
    get(requestOptions?: UserClient.RequestOptions): core.HttpResponsePromise<SeedApi.anyAuth.User[]>;
    private __get;
    /**
     * @param {UserClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.anyAuth.user.getAdmins()
     */
    getAdmins(requestOptions?: UserClient.RequestOptions): core.HttpResponsePromise<SeedApi.anyAuth.User[]>;
    private __getAdmins;
}
