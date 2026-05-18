import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../../../BaseClient.mjs";
import { type NormalizedClientOptionsWithAuth } from "../../../../../../../../BaseClient.mjs";
import * as core from "../../../../../../../../core/index.mjs";
import type * as SeedApi from "../../../../../../../index.mjs";
export declare namespace DuplicateNamesAClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class DuplicateNamesAClient {
    protected readonly _options: NormalizedClientOptionsWithAuth<DuplicateNamesAClient.Options>;
    constructor(options: DuplicateNamesAClient.Options);
    /**
     * List endpoint for service A
     *
     * @param {SeedApi.goDeterministicOrdering.endpoints.ListDuplicateNamesARequest} request
     * @param {DuplicateNamesAClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.goDeterministicOrdering.endpoints.duplicateNamesA.list()
     */
    list(request?: SeedApi.goDeterministicOrdering.endpoints.ListDuplicateNamesARequest, requestOptions?: DuplicateNamesAClient.RequestOptions): core.HttpResponsePromise<void>;
    private __list;
    /**
     * Create endpoint for service A
     *
     * @param {SeedApi.goDeterministicOrdering.endpoints.CreateDuplicateNamesARequest} request
     * @param {DuplicateNamesAClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.goDeterministicOrdering.endpoints.duplicateNamesA.create({
     *         name: "name",
     *         value: 1
     *     })
     */
    create(request: SeedApi.goDeterministicOrdering.endpoints.CreateDuplicateNamesARequest, requestOptions?: DuplicateNamesAClient.RequestOptions): core.HttpResponsePromise<SeedApi.goDeterministicOrdering.TypesObjectWithOptionalField>;
    private __create;
    /**
     * Get endpoint for service A
     *
     * @param {SeedApi.goDeterministicOrdering.endpoints.GetDuplicateNamesARequest} request
     * @param {DuplicateNamesAClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.goDeterministicOrdering.endpoints.duplicateNamesA.get({
     *         id: "id"
     *     })
     */
    get(request: SeedApi.goDeterministicOrdering.endpoints.GetDuplicateNamesARequest, requestOptions?: DuplicateNamesAClient.RequestOptions): core.HttpResponsePromise<void>;
    private __get;
}
