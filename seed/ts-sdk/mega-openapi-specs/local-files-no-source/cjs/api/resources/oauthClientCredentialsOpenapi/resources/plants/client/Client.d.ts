import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.js";
import { type NormalizedClientOptionsWithAuth } from "../../../../../../BaseClient.js";
import * as core from "../../../../../../core/index.js";
import type * as SeedApi from "../../../../../index.js";
export declare namespace PlantsClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class PlantsClient {
    protected readonly _options: NormalizedClientOptionsWithAuth<PlantsClient.Options>;
    constructor(options: PlantsClient.Options);
    /**
     * @param {PlantsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.oauthClientCredentialsOpenapi.plants.list()
     */
    list(requestOptions?: PlantsClient.RequestOptions): core.HttpResponsePromise<SeedApi.oauthClientCredentialsOpenapi.Plant[]>;
    private __list;
    /**
     * @param {SeedApi.oauthClientCredentialsOpenapi.GetPlantsRequest} request
     * @param {PlantsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.oauthClientCredentialsOpenapi.plants.get({
     *         plantId: "plantId"
     *     })
     */
    get(request: SeedApi.oauthClientCredentialsOpenapi.GetPlantsRequest, requestOptions?: PlantsClient.RequestOptions): core.HttpResponsePromise<SeedApi.oauthClientCredentialsOpenapi.Plant>;
    private __get;
}
