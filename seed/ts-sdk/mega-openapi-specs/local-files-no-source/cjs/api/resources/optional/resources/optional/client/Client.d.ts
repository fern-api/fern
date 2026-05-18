import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.js";
import * as core from "../../../../../../core/index.js";
import type * as SeedApi from "../../../../../index.js";
export declare namespace OptionalClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class OptionalClient {
    protected readonly _options: NormalizedClientOptions<OptionalClient.Options>;
    constructor(options: OptionalClient.Options);
    /**
     * @param {Record<string, unknown> | null} request
     * @param {OptionalClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.optional.optional.sendOptionalBody({
     *         "key": "value"
     *     })
     */
    sendOptionalBody(request: Record<string, unknown> | null, requestOptions?: OptionalClient.RequestOptions): core.HttpResponsePromise<string>;
    private __sendOptionalBody;
    /**
     * @param {SeedApi.optional.SendOptionalBodyRequest | null} request
     * @param {OptionalClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.optional.optional.sendOptionalTypedBody({
     *         message: "message"
     *     })
     */
    sendOptionalTypedBody(request: SeedApi.optional.SendOptionalBodyRequest | null, requestOptions?: OptionalClient.RequestOptions): core.HttpResponsePromise<string>;
    private __sendOptionalTypedBody;
    /**
     * Tests optional(nullable(T)) where T has only optional properties.
     * This should not generate wire tests expecting {} when Optional.empty() is passed.
     *
     * @param {SeedApi.optional.SendOptionalNullableWithAllOptionalPropertiesOptionalRequest} request
     * @param {OptionalClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.optional.optional.sendOptionalNullableWithAllOptionalProperties({
     *         actionId: "actionId",
     *         id: "id",
     *         body: {}
     *     })
     */
    sendOptionalNullableWithAllOptionalProperties(request: SeedApi.optional.SendOptionalNullableWithAllOptionalPropertiesOptionalRequest, requestOptions?: OptionalClient.RequestOptions): core.HttpResponsePromise<SeedApi.optional.DeployResponse>;
    private __sendOptionalNullableWithAllOptionalProperties;
}
