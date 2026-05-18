import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.js";
import * as core from "../../../../../../core/index.js";
import type * as SeedApi from "../../../../../index.js";
export declare namespace TypesClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class TypesClient {
    protected readonly _options: NormalizedClientOptions<TypesClient.Options>;
    constructor(options: TypesClient.Options);
    /**
     * @param {SeedApi.unionsWithLocalDate.GetTypesRequest} request
     * @param {TypesClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.unionsWithLocalDate.types.get({
     *         id: "date-example"
     *     })
     */
    get(request: SeedApi.unionsWithLocalDate.GetTypesRequest, requestOptions?: TypesClient.RequestOptions): core.HttpResponsePromise<SeedApi.unionsWithLocalDate.UnionWithTime>;
    private __get;
    /**
     * @param {SeedApi.unionsWithLocalDate.UnionWithTime} request
     * @param {TypesClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.unionsWithLocalDate.types.update({
     *         type: "date",
     *         value: "1994-01-01"
     *     })
     *
     * @example
     *     await client.unionsWithLocalDate.types.update({
     *         type: "datetime",
     *         value: "1994-01-01T01:01:01Z"
     *     })
     */
    update(request: SeedApi.unionsWithLocalDate.UnionWithTime, requestOptions?: TypesClient.RequestOptions): core.HttpResponsePromise<boolean>;
    private __update;
}
