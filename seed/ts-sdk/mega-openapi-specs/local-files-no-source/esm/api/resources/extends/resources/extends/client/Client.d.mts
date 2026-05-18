import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.mjs";
import * as core from "../../../../../../core/index.mjs";
import type * as SeedApi from "../../../../../index.mjs";
export declare namespace ExtendsClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class ExtendsClient {
    protected readonly _options: NormalizedClientOptions<ExtendsClient.Options>;
    constructor(options: ExtendsClient.Options);
    /**
     * @param {SeedApi.extends_.ExtendedInlineRequestBodyRequest} request
     * @param {ExtendsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.extends.extends.extendedInlineRequestBody({
     *         docs: "Types extend this type to include a docs property.",
     *         name: "Example",
     *         unique: "unique"
     *     })
     */
    extendedInlineRequestBody(request: SeedApi.extends_.ExtendedInlineRequestBodyRequest, requestOptions?: ExtendsClient.RequestOptions): core.HttpResponsePromise<void>;
    private __extendedInlineRequestBody;
}
