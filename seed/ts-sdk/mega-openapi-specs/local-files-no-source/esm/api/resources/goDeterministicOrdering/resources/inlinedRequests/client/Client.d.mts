import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.mjs";
import * as core from "../../../../../../core/index.mjs";
import * as SeedApi from "../../../../../index.mjs";
export declare namespace InlinedRequestsClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class InlinedRequestsClient {
    protected readonly _options: NormalizedClientOptions<InlinedRequestsClient.Options>;
    constructor(options: InlinedRequestsClient.Options);
    /**
     * POST with custom object in request body, response is an object
     *
     * @param {SeedApi.goDeterministicOrdering.PostWithObjectBodyandResponseInlinedRequestsRequest} request
     * @param {InlinedRequestsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @throws {@link SeedApi.goDeterministicOrdering.BadRequestError}
     *
     * @example
     *     await client.goDeterministicOrdering.inlinedRequests.postWithObjectBodyandResponse({
     *         string: "string",
     *         integer: 1,
     *         NestedObject: {}
     *     })
     */
    postWithObjectBodyandResponse(request: SeedApi.goDeterministicOrdering.PostWithObjectBodyandResponseInlinedRequestsRequest, requestOptions?: InlinedRequestsClient.RequestOptions): core.HttpResponsePromise<SeedApi.goDeterministicOrdering.TypesObjectWithOptionalField>;
    private __postWithObjectBodyandResponse;
}
