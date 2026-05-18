import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.mjs";
import * as core from "../../../../../../core/index.mjs";
import type * as SeedApi from "../../../../../index.mjs";
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
