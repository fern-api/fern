import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.js";
import * as core from "../../../../../../core/index.js";
import type * as SeedApi from "../../../../../index.js";
import { EventsClient } from "../resources/events/client/Client.js";
export declare namespace UserClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class UserClient {
    protected readonly _options: NormalizedClientOptions<UserClient.Options>;
    protected _events: EventsClient | undefined;
    constructor(options: UserClient.Options);
    get events(): EventsClient;
    /**
     * List all users.
     *
     * @param {SeedApi.mixedFileDirectory.ListUserRequest} request
     * @param {UserClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.mixedFileDirectory.user.list()
     */
    list(request?: SeedApi.mixedFileDirectory.ListUserRequest, requestOptions?: UserClient.RequestOptions): core.HttpResponsePromise<SeedApi.mixedFileDirectory.User[]>;
    private __list;
}
