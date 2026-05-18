import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.js";
import * as core from "../../../../../../core/index.js";
import type * as SeedApi from "../../../../../index.js";
export declare namespace FooClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class FooClient {
    protected readonly _options: NormalizedClientOptions<FooClient.Options>;
    constructor(options: FooClient.Options);
    /**
     * @param {SeedApi.crossPackageTypeNames.FindFooRequest} request
     * @param {FooClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.crossPackageTypeNames.foo.find()
     */
    find(request?: SeedApi.crossPackageTypeNames.FindFooRequest, requestOptions?: FooClient.RequestOptions): core.HttpResponsePromise<SeedApi.crossPackageTypeNames.ImportingType>;
    private __find;
}
