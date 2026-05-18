import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.mjs";
import * as core from "../../../../../../core/index.mjs";
export declare namespace TasktestClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class TasktestClient {
    protected readonly _options: NormalizedClientOptions<TasktestClient.Options>;
    constructor(options: TasktestClient.Options);
    /**
     * @param {TasktestClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.csharpNamespaceConflict.tasktest.hello()
     */
    hello(requestOptions?: TasktestClient.RequestOptions): core.HttpResponsePromise<void>;
    private __hello;
}
