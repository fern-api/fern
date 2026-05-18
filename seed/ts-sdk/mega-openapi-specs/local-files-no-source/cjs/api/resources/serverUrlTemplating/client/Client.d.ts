import type { BaseClientOptions, BaseRequestOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../BaseClient.js";
import * as core from "../../../../core/index.js";
import type * as SeedApi from "../../../index.js";
export declare namespace ServerUrlTemplatingClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class ServerUrlTemplatingClient {
    protected readonly _options: NormalizedClientOptions<ServerUrlTemplatingClient.Options>;
    constructor(options: ServerUrlTemplatingClient.Options);
    /**
     * @param {ServerUrlTemplatingClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.serverUrlTemplating.getUsers()
     */
    getUsers(requestOptions?: ServerUrlTemplatingClient.RequestOptions): core.HttpResponsePromise<SeedApi.serverUrlTemplating.User[]>;
    private __getUsers;
    /**
     * @param {SeedApi.serverUrlTemplating.GetUserRequest} request
     * @param {ServerUrlTemplatingClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.serverUrlTemplating.getUser({
     *         userId: "userId"
     *     })
     */
    getUser(request: SeedApi.serverUrlTemplating.GetUserRequest, requestOptions?: ServerUrlTemplatingClient.RequestOptions): core.HttpResponsePromise<SeedApi.serverUrlTemplating.User>;
    private __getUser;
    /**
     * @param {SeedApi.serverUrlTemplating.TokenRequest} request
     * @param {ServerUrlTemplatingClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.serverUrlTemplating.getToken({
     *         client_id: "client_id",
     *         client_secret: "client_secret"
     *     })
     */
    getToken(request: SeedApi.serverUrlTemplating.TokenRequest, requestOptions?: ServerUrlTemplatingClient.RequestOptions): core.HttpResponsePromise<SeedApi.serverUrlTemplating.TokenResponse>;
    private __getToken;
}
