import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.js";
import { type NormalizedClientOptionsWithAuth } from "../../../../../../BaseClient.js";
import * as core from "../../../../../../core/index.js";
import type * as SeedApi from "../../../../../index.js";
export declare namespace ServiceClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class ServiceClient {
    protected readonly _options: NormalizedClientOptionsWithAuth<ServiceClient.Options>;
    constructor(options: ServiceClient.Options);
    /**
     * @param {SeedApi.oauthClientCredentialsWithVariables.PostServiceRequest} request
     * @param {ServiceClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.oauthClientCredentialsWithVariables.service.post({
     *         endpointParam: "endpointParam"
     *     })
     */
    post(request: SeedApi.oauthClientCredentialsWithVariables.PostServiceRequest, requestOptions?: ServiceClient.RequestOptions): core.HttpResponsePromise<void>;
    private __post;
}
