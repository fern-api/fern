import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.mjs";
import * as core from "../../../../../../core/index.mjs";
import type * as SeedApi from "../../../../../index.mjs";
export declare namespace ServiceClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class ServiceClient {
    protected readonly _options: NormalizedClientOptions<ServiceClient.Options>;
    constructor(options: ServiceClient.Options);
    /**
     * Rerank documents based on relevance to a query
     *
     * @param {SeedApi.goUndiscriminatedUnionWireTests.RerankRequest} request
     * @param {ServiceClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.goUndiscriminatedUnionWireTests.service.rerank({
     *         documents: [{
     *                 text: "Carson City is the capital city of the American state of Nevada."
     *             }, {
     *                 text: "Washington, D.C. is the capital of the United States."
     *             }],
     *         query: "What is the capital of the United States?"
     *     })
     */
    rerank(request: SeedApi.goUndiscriminatedUnionWireTests.RerankRequest, requestOptions?: ServiceClient.RequestOptions): core.HttpResponsePromise<SeedApi.goUndiscriminatedUnionWireTests.RerankResponse>;
    private __rerank;
}
