import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.mjs";
import * as core from "../../../../../../core/index.mjs";
import type * as SeedApi from "../../../../../index.mjs";
export declare namespace AliasExtendsClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class AliasExtendsClient {
    protected readonly _options: NormalizedClientOptions<AliasExtendsClient.Options>;
    constructor(options: AliasExtendsClient.Options);
    /**
     * @param {SeedApi.aliasExtends.ExtendedInlineRequestBodyRequest} request
     * @param {AliasExtendsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.aliasExtends.aliasExtends.extendedInlineRequestBody({
     *         child: "child"
     *     })
     */
    extendedInlineRequestBody(request: SeedApi.aliasExtends.ExtendedInlineRequestBodyRequest, requestOptions?: AliasExtendsClient.RequestOptions): core.HttpResponsePromise<void>;
    private __extendedInlineRequestBody;
}
