import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.js";
import { type NormalizedClientOptionsWithAuth } from "../../../../../../BaseClient.js";
import * as core from "../../../../../../core/index.js";
export declare namespace ItemsClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class ItemsClient {
    protected readonly _options: NormalizedClientOptionsWithAuth<ItemsClient.Options>;
    constructor(options: ItemsClient.Options);
    /**
     * @param {ItemsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.multiUrlEnvironmentReference.items.listItems()
     */
    listItems(requestOptions?: ItemsClient.RequestOptions): core.HttpResponsePromise<string>;
    private __listItems;
}
