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
     * @param {SeedApi.queryParameters.GetUsernameUserRequest} request
     * @param {UserClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.queryParameters.user.getUsername({
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
     *         filter: "filter"
     *     })
     */
    getUsername(request: SeedApi.queryParameters.GetUsernameUserRequest, requestOptions?: UserClient.RequestOptions): core.HttpResponsePromise<SeedApi.queryParameters.User>;
    private __getUsername;
}
