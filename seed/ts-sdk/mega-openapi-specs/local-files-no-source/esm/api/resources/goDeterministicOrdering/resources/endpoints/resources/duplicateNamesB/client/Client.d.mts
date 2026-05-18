import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../../../BaseClient.mjs";
import { type NormalizedClientOptionsWithAuth } from "../../../../../../../../BaseClient.mjs";
import * as core from "../../../../../../../../core/index.mjs";
import type * as SeedApi from "../../../../../../../index.mjs";
export declare namespace DuplicateNamesBClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class DuplicateNamesBClient {
    protected readonly _options: NormalizedClientOptionsWithAuth<DuplicateNamesBClient.Options>;
    constructor(options: DuplicateNamesBClient.Options);
    /**
     * List endpoint for service B
     *
     * @param {SeedApi.goDeterministicOrdering.endpoints.ListDuplicateNamesBRequest} request
     * @param {DuplicateNamesBClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.goDeterministicOrdering.endpoints.duplicateNamesB.list()
     */
    list(request?: SeedApi.goDeterministicOrdering.endpoints.ListDuplicateNamesBRequest, requestOptions?: DuplicateNamesBClient.RequestOptions): core.HttpResponsePromise<void>;
    private __list;
    /**
     * Create endpoint for service B
     *
     * @param {SeedApi.goDeterministicOrdering.endpoints.CreateDuplicateNamesBRequest} request
     * @param {DuplicateNamesBClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.goDeterministicOrdering.endpoints.duplicateNamesB.create({
     *         description: "description",
     *         count: 1
     *     })
     */
    create(request: SeedApi.goDeterministicOrdering.endpoints.CreateDuplicateNamesBRequest, requestOptions?: DuplicateNamesBClient.RequestOptions): core.HttpResponsePromise<SeedApi.goDeterministicOrdering.TypesObjectWithOptionalField>;
    private __create;
    /**
     * Get endpoint for service B
     *
     * @param {SeedApi.goDeterministicOrdering.endpoints.GetDuplicateNamesBRequest} request
     * @param {DuplicateNamesBClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.goDeterministicOrdering.endpoints.duplicateNamesB.get({
     *         id: "id"
     *     })
     */
    get(request: SeedApi.goDeterministicOrdering.endpoints.GetDuplicateNamesBRequest, requestOptions?: DuplicateNamesBClient.RequestOptions): core.HttpResponsePromise<void>;
    private __get;
}
