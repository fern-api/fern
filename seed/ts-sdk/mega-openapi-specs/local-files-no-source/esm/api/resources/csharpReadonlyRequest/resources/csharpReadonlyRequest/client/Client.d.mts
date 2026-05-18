import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.mjs";
import * as core from "../../../../../../core/index.mjs";
import type * as SeedApi from "../../../../../index.mjs";
export declare namespace CsharpReadonlyRequestClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class CsharpReadonlyRequestClient {
    protected readonly _options: NormalizedClientOptions<CsharpReadonlyRequestClient.Options>;
    constructor(options: CsharpReadonlyRequestClient.Options);
    /**
     * @param {SeedApi.csharpReadonlyRequest.CreateVendorRequest} request
     * @param {CsharpReadonlyRequestClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.csharpReadonlyRequest.csharpReadonlyRequest.batchCreate({
     *         vendors: {
     *             "vendor-1": {
     *                 id: "vendor-1",
     *                 name: "Acme Corp",
     *                 created_at: "2024-01-01T00:00:00Z",
     *                 updated_at: "2024-01-01T00:00:00Z"
     *             }
     *         }
     *     })
     */
    batchCreate(request: SeedApi.csharpReadonlyRequest.CreateVendorRequest, requestOptions?: CsharpReadonlyRequestClient.RequestOptions): core.HttpResponsePromise<SeedApi.csharpReadonlyRequest.CreateVendorResponse>;
    private __batchCreate;
}
