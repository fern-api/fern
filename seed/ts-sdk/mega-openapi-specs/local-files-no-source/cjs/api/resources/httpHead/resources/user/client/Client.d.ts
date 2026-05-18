import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.js";
import * as core from "../../../../../../core/index.js";
import type * as SeedApi from "../../../../../index.js";
export declare namespace UserClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class UserClient {
    protected readonly _options: NormalizedClientOptions<UserClient.Options>;
    constructor(options: UserClient.Options);
    /**
     * @param {SeedApi.httpHead.ListUserRequest} request
     * @param {UserClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.httpHead.user.list({
     *         limit: 1
     *     })
     */
    list(request: SeedApi.httpHead.ListUserRequest, requestOptions?: UserClient.RequestOptions): core.HttpResponsePromise<SeedApi.httpHead.User[]>;
    private __list;
    /**
     * @param {UserClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.httpHead.user.head()
     */
    head(requestOptions?: UserClient.RequestOptions): core.HttpResponsePromise<Headers>;
    private __head;
}
