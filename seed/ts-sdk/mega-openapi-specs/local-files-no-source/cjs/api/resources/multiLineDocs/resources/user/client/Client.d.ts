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
     * Retrieve a user.
     * This endpoint is used to retrieve a user.
     *
     * @param {SeedApi.multiLineDocs.GetUserUserRequest} request
     * @param {UserClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.multiLineDocs.user.getUser({
     *         userId: "userId"
     *     })
     */
    getUser(request: SeedApi.multiLineDocs.GetUserUserRequest, requestOptions?: UserClient.RequestOptions): core.HttpResponsePromise<void>;
    private __getUser;
    /**
     * Create a new user.
     * This endpoint is used to create a new user.
     *
     * @param {SeedApi.multiLineDocs.CreateUserUserRequest} request
     * @param {UserClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.multiLineDocs.user.createUser({
     *         name: "name"
     *     })
     */
    createUser(request: SeedApi.multiLineDocs.CreateUserUserRequest, requestOptions?: UserClient.RequestOptions): core.HttpResponsePromise<SeedApi.multiLineDocs.User>;
    private __createUser;
}
