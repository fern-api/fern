import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.js";
import * as core from "../../../../../../core/index.js";
import type * as SeedApi from "../../../../../index.js";
export declare namespace AliasClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class AliasClient {
    protected readonly _options: NormalizedClientOptions<AliasClient.Options>;
    constructor(options: AliasClient.Options);
    /**
     * @param {SeedApi.alias.GetRequest} request
     * @param {AliasClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.alias.alias.get({
     *         typeId: "typeId"
     *     })
     */
    get(request: SeedApi.alias.GetRequest, requestOptions?: AliasClient.RequestOptions): core.HttpResponsePromise<void>;
    private __get;
}
