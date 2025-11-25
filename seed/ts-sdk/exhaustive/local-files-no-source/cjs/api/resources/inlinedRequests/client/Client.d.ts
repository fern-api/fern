import type { BaseClientOptions, BaseRequestOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../BaseClient.js";
import * as core from "../../../../core/index.js";
import * as SeedExhaustive from "../../../index.js";
export declare namespace InlinedRequestsClient {
    interface Options extends BaseClientOptions {
    }
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class InlinedRequestsClient {
    protected readonly _options: NormalizedClientOptions<InlinedRequestsClient.Options>;
    constructor(options: InlinedRequestsClient.Options);
    /**
     * POST with custom object in request body, response is an object
     *
     * @param {SeedExhaustive.PostWithObjectBody} request
     * @param {InlinedRequestsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @throws {@link SeedExhaustive.BadRequestBody}
     *
     * @example
     *     await client.inlinedRequests.postWithObjectBodyandResponse({
     *         string: "string",
     *         integer: 1,
     *         NestedObject: {
     *             string: "string",
     *             integer: 1,
     *             long: 1000000,
     *             double: 1.1,
     *             bool: true,
     *             datetime: "2024-01-15T09:30:00Z",
     *             date: "2023-01-15",
     *             uuid: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
     *             base64: "SGVsbG8gd29ybGQh",
     *             list: ["list", "list"],
     *             set: ["set"],
     *             map: {
     *                 1: "map"
     *             },
     *             bigint: "1000000"
     *         }
     *     })
     */
    postWithObjectBodyandResponse(request: SeedExhaustive.PostWithObjectBody, requestOptions?: InlinedRequestsClient.RequestOptions): core.HttpResponsePromise<SeedExhaustive.types.ObjectWithOptionalField>;
    private __postWithObjectBodyandResponse;
}
