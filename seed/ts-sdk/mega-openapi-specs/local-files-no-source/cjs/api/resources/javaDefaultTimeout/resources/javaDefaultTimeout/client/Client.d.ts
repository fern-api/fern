import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.js";
import * as core from "../../../../../../core/index.js";
import type * as SeedApi from "../../../../../index.js";
export declare namespace JavaDefaultTimeoutClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class JavaDefaultTimeoutClient {
    protected readonly _options: NormalizedClientOptions<JavaDefaultTimeoutClient.Options>;
    constructor(options: JavaDefaultTimeoutClient.Options);
    /**
     * @param {JavaDefaultTimeoutClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.javaDefaultTimeout.javaDefaultTimeout.getUser()
     */
    getUser(requestOptions?: JavaDefaultTimeoutClient.RequestOptions): core.HttpResponsePromise<SeedApi.javaDefaultTimeout.User>;
    private __getUser;
}
