import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.js";
import * as core from "../../../../../../core/index.js";
import type * as SeedApi from "../../../../../index.js";
export declare namespace ServiceClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class ServiceClient {
    protected readonly _options: NormalizedClientOptions<ServiceClient.Options>;
    constructor(options: ServiceClient.Options);
    /**
     * @param {SeedApi.javaOutputDirectory.GetUserServiceRequest} request
     * @param {ServiceClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.javaOutputDirectory.service.getUser({
     *         userId: "userId"
     *     })
     */
    getUser(request: SeedApi.javaOutputDirectory.GetUserServiceRequest, requestOptions?: ServiceClient.RequestOptions): core.HttpResponsePromise<SeedApi.javaOutputDirectory.User>;
    private __getUser;
}
