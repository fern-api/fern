import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.js";
import * as core from "../../../../../../core/index.js";
import type * as SeedApi from "../../../../../index.js";
export declare namespace SinglePropertyClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class SinglePropertyClient {
    protected readonly _options: NormalizedClientOptions<SinglePropertyClient.Options>;
    constructor(options: SinglePropertyClient.Options);
    /**
     * @param {SeedApi.javaSinglePropertyEndpoint.DoThingSinglePropertyRequest} request
     * @param {SinglePropertyClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.javaSinglePropertyEndpoint.singleProperty.doThing({
     *         id: "id"
     *     })
     */
    doThing(request: SeedApi.javaSinglePropertyEndpoint.DoThingSinglePropertyRequest, requestOptions?: SinglePropertyClient.RequestOptions): core.HttpResponsePromise<string>;
    private __doThing;
}
