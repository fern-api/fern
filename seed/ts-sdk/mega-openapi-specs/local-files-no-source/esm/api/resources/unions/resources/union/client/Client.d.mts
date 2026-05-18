import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.mjs";
import * as core from "../../../../../../core/index.mjs";
import type * as SeedApi from "../../../../../index.mjs";
export declare namespace UnionClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class UnionClient {
    protected readonly _options: NormalizedClientOptions<UnionClient.Options>;
    constructor(options: UnionClient.Options);
    /**
     * @param {SeedApi.unions.GetUnionRequest} request
     * @param {UnionClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.unions.union.get({
     *         id: "id"
     *     })
     */
    get(request: SeedApi.unions.GetUnionRequest, requestOptions?: UnionClient.RequestOptions): core.HttpResponsePromise<SeedApi.unions.Shape>;
    private __get;
    /**
     * @param {SeedApi.unions.Shape} request
     * @param {UnionClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.unions.union.update({
     *         radius: 1.1,
     *         type: "circle"
     *     })
     */
    update(request: SeedApi.unions.Shape, requestOptions?: UnionClient.RequestOptions): core.HttpResponsePromise<boolean>;
    private __update;
}
