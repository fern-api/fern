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
     * @param {SeedApi.pathParameters.GetUserUserRequest} request
     * @param {UserClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.pathParameters.user.getUser({
     *         tenant_id: "tenant_id",
     *         user_id: "user_id"
     *     })
     */
    getUser(request: SeedApi.pathParameters.GetUserUserRequest, requestOptions?: UserClient.RequestOptions): core.HttpResponsePromise<SeedApi.pathParameters.User>;
    private __getUser;
    /**
     * @param {SeedApi.pathParameters.UpdateUserUserRequest} request
     * @param {UserClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.pathParameters.user.updateUser({
     *         tenant_id: "tenant_id",
     *         user_id: "user_id",
     *         body: {
     *             name: "name",
     *             tags: ["tags"]
     *         }
     *     })
     */
    updateUser(request: SeedApi.pathParameters.UpdateUserUserRequest, requestOptions?: UserClient.RequestOptions): core.HttpResponsePromise<SeedApi.pathParameters.User>;
    private __updateUser;
    /**
     * @param {SeedApi.pathParameters.CreateUserUserRequest} request
     * @param {UserClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.pathParameters.user.createUser({
     *         tenant_id: "tenant_id",
     *         body: {
     *             name: "name",
     *             tags: ["tags"]
     *         }
     *     })
     */
    createUser(request: SeedApi.pathParameters.CreateUserUserRequest, requestOptions?: UserClient.RequestOptions): core.HttpResponsePromise<SeedApi.pathParameters.User>;
    private __createUser;
    /**
     * @param {SeedApi.pathParameters.SearchUsersUserRequest} request
     * @param {UserClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.pathParameters.user.searchUsers({
     *         tenant_id: "tenant_id",
     *         user_id: "user_id"
     *     })
     */
    searchUsers(request: SeedApi.pathParameters.SearchUsersUserRequest, requestOptions?: UserClient.RequestOptions): core.HttpResponsePromise<SeedApi.pathParameters.User[]>;
    private __searchUsers;
    /**
     * Test endpoint with path parameter that has a text prefix (v{version})
     *
     * @param {SeedApi.pathParameters.GetUserMetadataUserRequest} request
     * @param {UserClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.pathParameters.user.getUserMetadata({
     *         tenant_id: "tenant_id",
     *         user_id: "user_id",
     *         version: 1
     *     })
     */
    getUserMetadata(request: SeedApi.pathParameters.GetUserMetadataUserRequest, requestOptions?: UserClient.RequestOptions): core.HttpResponsePromise<SeedApi.pathParameters.User>;
    private __getUserMetadata;
    /**
     * Test endpoint with path parameters listed in different order than found in path
     *
     * @param {SeedApi.pathParameters.GetUserSpecificsUserRequest} request
     * @param {UserClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.pathParameters.user.getUserSpecifics({
     *         tenant_id: "tenant_id",
     *         user_id: "user_id",
     *         version: 1,
     *         thought: "thought"
     *     })
     */
    getUserSpecifics(request: SeedApi.pathParameters.GetUserSpecificsUserRequest, requestOptions?: UserClient.RequestOptions): core.HttpResponsePromise<SeedApi.pathParameters.User>;
    private __getUserSpecifics;
}
