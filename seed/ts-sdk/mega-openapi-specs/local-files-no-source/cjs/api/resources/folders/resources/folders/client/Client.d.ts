import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.js";
import * as core from "../../../../../../core/index.js";
export declare namespace FoldersClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class FoldersClient {
    protected readonly _options: NormalizedClientOptions<FoldersClient.Options>;
    constructor(options: FoldersClient.Options);
    /**
     * @param {FoldersClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.folders.folders.foo()
     */
    foo(requestOptions?: FoldersClient.RequestOptions): core.HttpResponsePromise<void>;
    private __foo;
}
