import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.mjs";
import * as core from "../../../../../../core/index.mjs";
import type * as SeedApi from "../../../../../index.mjs";
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
