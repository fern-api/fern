import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.mjs";
import * as core from "../../../../../../core/index.mjs";
export declare namespace PropertyBasedErrorClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class PropertyBasedErrorClient {
    protected readonly _options: NormalizedClientOptions<PropertyBasedErrorClient.Options>;
    constructor(options: PropertyBasedErrorClient.Options);
    /**
     * GET request that always throws an error
     *
     * @param {PropertyBasedErrorClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @throws {@link SeedApi.errorProperty.BadRequestError}
     *
     * @example
     *     await client.errorProperty.propertyBasedError.throwError()
     */
    throwError(requestOptions?: PropertyBasedErrorClient.RequestOptions): core.HttpResponsePromise<string>;
    private __throwError;
}
