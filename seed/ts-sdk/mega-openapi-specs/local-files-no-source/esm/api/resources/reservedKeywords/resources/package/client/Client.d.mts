import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.mjs";
import * as core from "../../../../../../core/index.mjs";
import type * as SeedApi from "../../../../../index.mjs";
export declare namespace PackageClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class PackageClient {
    protected readonly _options: NormalizedClientOptions<PackageClient.Options>;
    constructor(options: PackageClient.Options);
    /**
     * @param {SeedApi.reservedKeywords.TestPackageRequest} request
     * @param {PackageClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.reservedKeywords.package.test({
     *         "for": "for"
     *     })
     */
    test(request: SeedApi.reservedKeywords.TestPackageRequest, requestOptions?: PackageClient.RequestOptions): core.HttpResponsePromise<void>;
    private __test;
}
