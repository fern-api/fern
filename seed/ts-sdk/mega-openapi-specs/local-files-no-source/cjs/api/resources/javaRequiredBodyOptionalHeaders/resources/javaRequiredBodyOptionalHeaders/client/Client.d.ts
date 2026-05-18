import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.js";
import * as core from "../../../../../../core/index.js";
import type * as SeedApi from "../../../../../index.js";
export declare namespace JavaRequiredBodyOptionalHeadersClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class JavaRequiredBodyOptionalHeadersClient {
    protected readonly _options: NormalizedClientOptions<JavaRequiredBodyOptionalHeadersClient.Options>;
    constructor(options: JavaRequiredBodyOptionalHeadersClient.Options);
    /**
     * Get all users with optional filtering.
     *
     * @param {SeedApi.javaRequiredBodyOptionalHeaders.GetUsersRequest} request
     * @param {JavaRequiredBodyOptionalHeadersClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.javaRequiredBodyOptionalHeaders.javaRequiredBodyOptionalHeaders.getUsers()
     */
    getUsers(request?: SeedApi.javaRequiredBodyOptionalHeaders.GetUsersRequest, requestOptions?: JavaRequiredBodyOptionalHeadersClient.RequestOptions): core.HttpResponsePromise<SeedApi.javaRequiredBodyOptionalHeaders.User[]>;
    private __getUsers;
    /**
     * Create a new user. Has required body and optional header.
     *
     * @param {SeedApi.javaRequiredBodyOptionalHeaders.CreateUserRequest} request
     * @param {JavaRequiredBodyOptionalHeadersClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.javaRequiredBodyOptionalHeaders.javaRequiredBodyOptionalHeaders.createUser({
     *         body: {
     *             name: "name",
     *             email: "email"
     *         }
     *     })
     */
    createUser(request: SeedApi.javaRequiredBodyOptionalHeaders.CreateUserRequest, requestOptions?: JavaRequiredBodyOptionalHeadersClient.RequestOptions): core.HttpResponsePromise<SeedApi.javaRequiredBodyOptionalHeaders.User>;
    private __createUser;
    /**
     * Update an existing user. Has required body and optional query param.
     *
     * @param {SeedApi.javaRequiredBodyOptionalHeaders.UpdateUserRequest} request
     * @param {JavaRequiredBodyOptionalHeadersClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.javaRequiredBodyOptionalHeaders.javaRequiredBodyOptionalHeaders.updateUser({
     *         userId: "userId",
     *         body: {
     *             name: "name",
     *             email: "email"
     *         }
     *     })
     */
    updateUser(request: SeedApi.javaRequiredBodyOptionalHeaders.UpdateUserRequest, requestOptions?: JavaRequiredBodyOptionalHeadersClient.RequestOptions): core.HttpResponsePromise<SeedApi.javaRequiredBodyOptionalHeaders.User>;
    private __updateUser;
    /**
     * Create a user with optional header and query param.
     *
     * @param {SeedApi.javaRequiredBodyOptionalHeaders.CreateUserWithOptionsRequest} request
     * @param {JavaRequiredBodyOptionalHeadersClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.javaRequiredBodyOptionalHeaders.javaRequiredBodyOptionalHeaders.createUserWithOptions({
     *         body: {
     *             name: "name",
     *             email: "email"
     *         }
     *     })
     */
    createUserWithOptions(request: SeedApi.javaRequiredBodyOptionalHeaders.CreateUserWithOptionsRequest, requestOptions?: JavaRequiredBodyOptionalHeadersClient.RequestOptions): core.HttpResponsePromise<SeedApi.javaRequiredBodyOptionalHeaders.User>;
    private __createUserWithOptions;
    /**
     * Create a user with required header.
     *
     * @param {SeedApi.javaRequiredBodyOptionalHeaders.UserData} request
     * @param {JavaRequiredBodyOptionalHeadersClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.javaRequiredBodyOptionalHeaders.javaRequiredBodyOptionalHeaders.createUserWithRequiredHeader({
     *         name: "name",
     *         email: "email"
     *     })
     */
    createUserWithRequiredHeader(request: SeedApi.javaRequiredBodyOptionalHeaders.UserData, requestOptions?: JavaRequiredBodyOptionalHeadersClient.RequestOptions): core.HttpResponsePromise<SeedApi.javaRequiredBodyOptionalHeaders.User>;
    private __createUserWithRequiredHeader;
    /**
     * Create a user with required query param.
     *
     * @param {SeedApi.javaRequiredBodyOptionalHeaders.CreateUserWithRequiredQueryRequest} request
     * @param {JavaRequiredBodyOptionalHeadersClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.javaRequiredBodyOptionalHeaders.javaRequiredBodyOptionalHeaders.createUserWithRequiredQuery({
     *         tenantId: "tenantId",
     *         body: {
     *             name: "name",
     *             email: "email"
     *         }
     *     })
     */
    createUserWithRequiredQuery(request: SeedApi.javaRequiredBodyOptionalHeaders.CreateUserWithRequiredQueryRequest, requestOptions?: JavaRequiredBodyOptionalHeadersClient.RequestOptions): core.HttpResponsePromise<SeedApi.javaRequiredBodyOptionalHeaders.User>;
    private __createUserWithRequiredQuery;
    /**
     * Create a user with inlined body and optional header.
     *
     * @param {SeedApi.javaRequiredBodyOptionalHeaders.CreateUserInlinedRequest} request
     * @param {JavaRequiredBodyOptionalHeadersClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.javaRequiredBodyOptionalHeaders.javaRequiredBodyOptionalHeaders.createUserInlined({
     *         name: "name",
     *         email: "email"
     *     })
     */
    createUserInlined(request: SeedApi.javaRequiredBodyOptionalHeaders.CreateUserInlinedRequest, requestOptions?: JavaRequiredBodyOptionalHeadersClient.RequestOptions): core.HttpResponsePromise<SeedApi.javaRequiredBodyOptionalHeaders.User>;
    private __createUserInlined;
}
