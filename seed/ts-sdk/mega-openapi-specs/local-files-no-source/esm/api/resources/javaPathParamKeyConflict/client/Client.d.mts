import type { BaseClientOptions, BaseRequestOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../BaseClient.mjs";
import * as core from "../../../../core/index.mjs";
import type * as SeedApi from "../../../index.mjs";
export declare namespace JavaPathParamKeyConflictClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class JavaPathParamKeyConflictClient {
    protected readonly _options: NormalizedClientOptions<JavaPathParamKeyConflictClient.Options>;
    constructor(options: JavaPathParamKeyConflictClient.Options);
    /**
     * @param {SeedApi.javaPathParamKeyConflict.ItemData} request
     * @param {JavaPathParamKeyConflictClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.javaPathParamKeyConflict.createItem({
     *         key: "key",
     *         value: "value",
     *         data: "data"
     *     })
     */
    createItem(request: SeedApi.javaPathParamKeyConflict.ItemData, requestOptions?: JavaPathParamKeyConflictClient.RequestOptions): core.HttpResponsePromise<SeedApi.javaPathParamKeyConflict.Item>;
    private __createItem;
}
