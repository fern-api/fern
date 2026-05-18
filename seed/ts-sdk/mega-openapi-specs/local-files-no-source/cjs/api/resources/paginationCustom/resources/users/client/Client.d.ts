import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.js";
import * as core from "../../../../../../core/index.js";
import type * as SeedApi from "../../../../../index.js";
export declare namespace UsersClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class UsersClient {
    protected readonly _options: NormalizedClientOptions<UsersClient.Options>;
    constructor(options: UsersClient.Options);
    /**
     * @param {SeedApi.paginationCustom.ListWithCustomPagerUsersRequest} request
     * @param {UsersClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.paginationCustom.users.listWithCustomPager()
     */
    listWithCustomPager(request?: SeedApi.paginationCustom.ListWithCustomPagerUsersRequest, requestOptions?: UsersClient.RequestOptions): core.HttpResponsePromise<SeedApi.paginationCustom.UsersListResponse>;
    private __listWithCustomPager;
}
