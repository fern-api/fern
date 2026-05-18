import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.js";
import * as core from "../../../../../../core/index.js";
import type * as SeedApi from "../../../../../index.js";
export declare namespace NullableClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class NullableClient {
    protected readonly _options: NormalizedClientOptions<NullableClient.Options>;
    constructor(options: NullableClient.Options);
    /**
     * @param {SeedApi.nullable.GetUsersNullableRequest} request
     * @param {NullableClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.nullable.nullable.getUsers()
     */
    getUsers(request?: SeedApi.nullable.GetUsersNullableRequest, requestOptions?: NullableClient.RequestOptions): core.HttpResponsePromise<SeedApi.nullable.User[]>;
    private __getUsers;
    /**
     * @param {SeedApi.nullable.CreateUserNullableRequest} request
     * @param {NullableClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.nullable.nullable.createUser({
     *         username: "username"
     *     })
     */
    createUser(request: SeedApi.nullable.CreateUserNullableRequest, requestOptions?: NullableClient.RequestOptions): core.HttpResponsePromise<SeedApi.nullable.User>;
    private __createUser;
    /**
     * @param {SeedApi.nullable.DeleteUserNullableRequest} request
     * @param {NullableClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.nullable.nullable.deleteUser()
     */
    deleteUser(request?: SeedApi.nullable.DeleteUserNullableRequest, requestOptions?: NullableClient.RequestOptions): core.HttpResponsePromise<boolean>;
    private __deleteUser;
}
