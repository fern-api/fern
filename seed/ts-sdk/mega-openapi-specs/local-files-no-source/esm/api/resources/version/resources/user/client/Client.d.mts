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
