import type { BaseClientOptions, BaseRequestOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../BaseClient.js";
import * as core from "../../../../core/index.js";
import * as SeedApi from "../../../index.js";
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
     * @param {SeedApi.PostWithObjectBodyandResponseInlinedRequestsRequest} request
     * @param {InlinedRequestsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @throws {@link SeedApi.BadRequestError}
     *
     * @example
     *     await client.inlinedRequests.postWithObjectBodyandResponse({
     *         string: "string",
     *         integer: 1,
     *         NestedObject: {}
     *     })
     */
    postWithObjectBodyandResponse(request: SeedApi.PostWithObjectBodyandResponseInlinedRequestsRequest, requestOptions?: InlinedRequestsClient.RequestOptions): core.HttpResponsePromise<SeedApi.TypesObjectWithOptionalField>;
    private __postWithObjectBodyandResponse;
}
