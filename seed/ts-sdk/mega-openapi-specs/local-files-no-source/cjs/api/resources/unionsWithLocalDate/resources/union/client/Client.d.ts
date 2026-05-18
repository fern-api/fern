import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.js";
import * as core from "../../../../../../core/index.js";
import type * as SeedApi from "../../../../../index.js";
export declare namespace UnionClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class UnionClient {
    protected readonly _options: NormalizedClientOptions<UnionClient.Options>;
    constructor(options: UnionClient.Options);
    /**
     * @param {SeedApi.unionsWithLocalDate.GetUnionRequest} request
     * @param {UnionClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.unionsWithLocalDate.union.get({
     *         id: "id"
     *     })
     */
    get(request: SeedApi.unionsWithLocalDate.GetUnionRequest, requestOptions?: UnionClient.RequestOptions): core.HttpResponsePromise<SeedApi.unionsWithLocalDate.Shape>;
    private __get;
    /**
     * @param {SeedApi.unionsWithLocalDate.Shape} request
     * @param {UnionClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.unionsWithLocalDate.union.update({
     *         radius: 1.1,
     *         type: "circle"
     *     })
     */
    update(request: SeedApi.unionsWithLocalDate.Shape, requestOptions?: UnionClient.RequestOptions): core.HttpResponsePromise<boolean>;
    private __update;
}
