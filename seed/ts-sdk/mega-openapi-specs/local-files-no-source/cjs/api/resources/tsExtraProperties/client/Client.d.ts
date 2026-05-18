import type { BaseClientOptions, BaseRequestOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../BaseClient.js";
import * as core from "../../../../core/index.js";
import type * as SeedApi from "../../../index.js";
export declare namespace TsExtraPropertiesClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class TsExtraPropertiesClient {
    protected readonly _options: NormalizedClientOptions<TsExtraPropertiesClient.Options>;
    constructor(options: TsExtraPropertiesClient.Options);
    /**
     * @param {TsExtraPropertiesClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.tsExtraProperties.getUser()
     */
    getUser(requestOptions?: TsExtraPropertiesClient.RequestOptions): core.HttpResponsePromise<SeedApi.tsExtraProperties.User>;
    private __getUser;
    /**
     * @param {SeedApi.tsExtraProperties.CreateUserRequest} request
     * @param {TsExtraPropertiesClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.tsExtraProperties.createUser({
     *         user_name: "user_name"
     *     })
     */
    createUser(request: SeedApi.tsExtraProperties.CreateUserRequest, requestOptions?: TsExtraPropertiesClient.RequestOptions): core.HttpResponsePromise<SeedApi.tsExtraProperties.User>;
    private __createUser;
}
