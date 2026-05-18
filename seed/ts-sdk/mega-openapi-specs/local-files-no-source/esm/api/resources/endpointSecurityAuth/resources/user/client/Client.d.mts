import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.mjs";
import { type NormalizedClientOptionsWithAuth } from "../../../../../../BaseClient.mjs";
import * as core from "../../../../../../core/index.mjs";
import type * as SeedApi from "../../../../../index.mjs";
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
     *     await client.endpointSecurityAuth.user.getWithBearer()
     */
    getWithBearer(requestOptions?: UserClient.RequestOptions): core.HttpResponsePromise<SeedApi.endpointSecurityAuth.User[]>;
    private __getWithBearer;
    /**
     * @param {UserClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpointSecurityAuth.user.getWithApiKey()
     */
    getWithApiKey(requestOptions?: UserClient.RequestOptions): core.HttpResponsePromise<SeedApi.endpointSecurityAuth.User[]>;
    private __getWithApiKey;
    /**
     * @param {UserClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpointSecurityAuth.user.getWithOAuth()
     */
    getWithOAuth(requestOptions?: UserClient.RequestOptions): core.HttpResponsePromise<SeedApi.endpointSecurityAuth.User[]>;
    private __getWithOAuth;
    /**
     * @param {UserClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpointSecurityAuth.user.getWithBasic()
     */
    getWithBasic(requestOptions?: UserClient.RequestOptions): core.HttpResponsePromise<SeedApi.endpointSecurityAuth.User[]>;
    private __getWithBasic;
    /**
     * @param {UserClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpointSecurityAuth.user.getWithInferredAuth()
     */
    getWithInferredAuth(requestOptions?: UserClient.RequestOptions): core.HttpResponsePromise<SeedApi.endpointSecurityAuth.User[]>;
    private __getWithInferredAuth;
    /**
     * @param {UserClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpointSecurityAuth.user.getWithAnyAuth()
     */
    getWithAnyAuth(requestOptions?: UserClient.RequestOptions): core.HttpResponsePromise<SeedApi.endpointSecurityAuth.User[]>;
    private __getWithAnyAuth;
    /**
     * @param {UserClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpointSecurityAuth.user.getWithAllAuth()
     */
    getWithAllAuth(requestOptions?: UserClient.RequestOptions): core.HttpResponsePromise<SeedApi.endpointSecurityAuth.User[]>;
    private __getWithAllAuth;
}
