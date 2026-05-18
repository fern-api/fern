import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../../../BaseClient.mjs";
import { type NormalizedClientOptionsWithAuth } from "../../../../../../../../BaseClient.mjs";
import * as core from "../../../../../../../../core/index.mjs";
import type * as SeedApi from "../../../../../../../index.mjs";
export declare namespace DuplicateNamesCClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class DuplicateNamesCClient {
    protected readonly _options: NormalizedClientOptionsWithAuth<DuplicateNamesCClient.Options>;
    constructor(options: DuplicateNamesCClient.Options);
    /**
     * List endpoint for service C
     *
     * @param {SeedApi.goDeterministicOrdering.endpoints.ListDuplicateNamesCRequest} request
     * @param {DuplicateNamesCClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.goDeterministicOrdering.endpoints.duplicateNamesC.list()
     */
    list(request?: SeedApi.goDeterministicOrdering.endpoints.ListDuplicateNamesCRequest, requestOptions?: DuplicateNamesCClient.RequestOptions): core.HttpResponsePromise<void>;
    private __list;
    /**
     * Create endpoint for service C
     *
     * @param {SeedApi.goDeterministicOrdering.endpoints.CreateDuplicateNamesCRequest} request
     * @param {DuplicateNamesCClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.goDeterministicOrdering.endpoints.duplicateNamesC.create({
     *         label: "label",
     *         priority: 1
     *     })
     */
    create(request: SeedApi.goDeterministicOrdering.endpoints.CreateDuplicateNamesCRequest, requestOptions?: DuplicateNamesCClient.RequestOptions): core.HttpResponsePromise<SeedApi.goDeterministicOrdering.TypesObjectWithOptionalField>;
    private __create;
    /**
     * Get endpoint for service C
     *
     * @param {SeedApi.goDeterministicOrdering.endpoints.GetDuplicateNamesCRequest} request
     * @param {DuplicateNamesCClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.goDeterministicOrdering.endpoints.duplicateNamesC.get({
     *         id: "id"
     *     })
     */
    get(request: SeedApi.goDeterministicOrdering.endpoints.GetDuplicateNamesCRequest, requestOptions?: DuplicateNamesCClient.RequestOptions): core.HttpResponsePromise<void>;
    private __get;
}
