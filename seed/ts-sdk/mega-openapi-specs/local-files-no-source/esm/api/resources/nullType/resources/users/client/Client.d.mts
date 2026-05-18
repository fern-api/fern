import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.mjs";
import * as core from "../../../../../../core/index.mjs";
import type * as SeedApi from "../../../../../index.mjs";
export declare namespace UsersClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class UsersClient {
    protected readonly _options: NormalizedClientOptions<UsersClient.Options>;
    constructor(options: UsersClient.Options);
    /**
     * Gets a user by ID. The deleted_at field uses type null.
     *
     * @param {SeedApi.nullType.GetUsersRequest} request
     * @param {UsersClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.nullType.users.get({
     *         id: "id"
     *     })
     */
    get(request: SeedApi.nullType.GetUsersRequest, requestOptions?: UsersClient.RequestOptions): core.HttpResponsePromise<SeedApi.nullType.User>;
    private __get;
}
