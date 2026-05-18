import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.mjs";
import * as core from "../../../../../../core/index.mjs";
import { ServiceClient } from "../resources/service/client/Client.mjs";
export declare namespace FolderClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class FolderClient {
    protected readonly _options: NormalizedClientOptions<FolderClient.Options>;
    protected _service: ServiceClient | undefined;
    constructor(options: FolderClient.Options);
    get service(): ServiceClient;
    /**
     * @param {FolderClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.folders.folder.foo()
     */
    foo(requestOptions?: FolderClient.RequestOptions): core.HttpResponsePromise<void>;
    private __foo;
}
