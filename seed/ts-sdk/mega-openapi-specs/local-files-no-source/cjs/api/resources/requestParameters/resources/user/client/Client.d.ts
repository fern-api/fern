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
     * @param {SeedApi.requestParameters.CreateUsernameUserRequest} request
     * @param {UserClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.requestParameters.user.createUsername({
     *         tags: ["tags"],
     *         username: "username",
     *         password: "password",
     *         name: "name"
     *     })
     */
    createUsername(request: SeedApi.requestParameters.CreateUsernameUserRequest, requestOptions?: UserClient.RequestOptions): core.HttpResponsePromise<void>;
    private __createUsername;
    /**
     * @param {SeedApi.requestParameters.CreateUsernameBody} request
     * @param {UserClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.requestParameters.user.createUsernameWithReferencedType({
     *         tags: ["tags"],
     *         username: "username",
     *         password: "password",
     *         name: "name"
     *     })
     */
    createUsernameWithReferencedType(request: SeedApi.requestParameters.CreateUsernameBody, requestOptions?: UserClient.RequestOptions): core.HttpResponsePromise<void>;
    private __createUsernameWithReferencedType;
    /**
     * @param {SeedApi.requestParameters.CreateUsernameBodyOptionalProperties | null} request
     * @param {UserClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.requestParameters.user.createUsernameOptional({})
     */
    createUsernameOptional(request: SeedApi.requestParameters.CreateUsernameBodyOptionalProperties | null, requestOptions?: UserClient.RequestOptions): core.HttpResponsePromise<void>;
    private __createUsernameOptional;
    /**
     * @param {SeedApi.requestParameters.GetUsernameUserRequest} request
     * @param {UserClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.requestParameters.user.getUsername({
     *         limit: 1,
     *         id: "id",
     *         date: "2023-01-15",
     *         deadline: "2024-01-15T09:30:00Z",
     *         bytes: "bytes",
     *         user: {
     *             name: "name",
     *             tags: ["tags", "tags"]
     *         },
     *         userList: {
     *             name: "name",
     *             tags: ["tags", "tags"]
     *         },
     *         optionalDeadline: "2024-01-15T09:30:00Z",
     *         keyValue: {
     *             "keyValue": "keyValue"
     *         },
     *         optionalString: "optionalString",
     *         nestedUser: {
     *             name: "name",
     *             user: {
     *                 name: "name",
     *                 tags: ["tags", "tags"]
     *             }
     *         },
     *         optionalUser: {
     *             name: "name",
     *             tags: ["tags", "tags"]
     *         },
     *         excludeUser: {
     *             name: "name",
     *             tags: ["tags", "tags"]
     *         },
     *         filter: "filter",
     *         longParam: 1000000,
     *         bigIntParam: 1
     *     })
     */
    getUsername(request: SeedApi.requestParameters.GetUsernameUserRequest, requestOptions?: UserClient.RequestOptions): core.HttpResponsePromise<SeedApi.requestParameters.User>;
    private __getUsername;
}
