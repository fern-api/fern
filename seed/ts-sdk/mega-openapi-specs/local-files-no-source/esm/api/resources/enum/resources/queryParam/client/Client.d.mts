import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.mjs";
import * as core from "../../../../../../core/index.mjs";
import type * as SeedApi from "../../../../../index.mjs";
export declare namespace QueryParamClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class QueryParamClient {
    protected readonly _options: NormalizedClientOptions<QueryParamClient.Options>;
    constructor(options: QueryParamClient.Options);
    /**
     * @param {SeedApi.enum_.SendQueryParamRequest} request
     * @param {QueryParamClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.enum.queryParam.send({
     *         operand: ">",
     *         operandOrColor: "red"
     *     })
     */
    send(request: SeedApi.enum_.SendQueryParamRequest, requestOptions?: QueryParamClient.RequestOptions): core.HttpResponsePromise<void>;
    private __send;
    /**
     * @param {SeedApi.enum_.SendListQueryParamRequest} request
     * @param {QueryParamClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.enum.queryParam.sendList({
     *         operand: [">"],
     *         operandOrColor: ["red"]
     *     })
     */
    sendList(request?: SeedApi.enum_.SendListQueryParamRequest, requestOptions?: QueryParamClient.RequestOptions): core.HttpResponsePromise<void>;
    private __sendList;
}
