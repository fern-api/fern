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
     * @param {SeedApi.version.GetUserUserRequest} request
     * @param {UserClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.version.user.getUser({
     *         userId: "userId"
     *     })
     */
    getUser(request: SeedApi.version.GetUserUserRequest, requestOptions?: UserClient.RequestOptions): core.HttpResponsePromise<SeedApi.version.User>;
    private __getUser;
}
