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
     * @param {SeedApi.paginationCustom.ListWithCustomPagerUsersRequest} request
     * @param {UsersClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.paginationCustom.users.listWithCustomPager()
     */
    listWithCustomPager(request?: SeedApi.paginationCustom.ListWithCustomPagerUsersRequest, requestOptions?: UsersClient.RequestOptions): core.HttpResponsePromise<SeedApi.paginationCustom.UsersListResponse>;
    private __listWithCustomPager;
}
