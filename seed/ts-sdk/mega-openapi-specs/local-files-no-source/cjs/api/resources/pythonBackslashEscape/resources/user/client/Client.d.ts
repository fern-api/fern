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
     * Get a user by their ID.
     * For Windows authentication, use DOMAIN\username format.
     * Other backslash examples: FOO\_BAR, path\to\file, C:\Users\name
     *
     * @param {SeedApi.pythonBackslashEscape.GetUserRequest} request
     * @param {UserClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.pythonBackslashEscape.user.get({
     *         id: "id"
     *     })
     */
    get(request: SeedApi.pythonBackslashEscape.GetUserRequest, requestOptions?: UserClient.RequestOptions): core.HttpResponsePromise<SeedApi.pythonBackslashEscape.User>;
    private __get;
}
