import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../../../BaseClient.js";
import { type NormalizedClientOptionsWithAuth } from "../../../../../../../../BaseClient.js";
import * as core from "../../../../../../../../core/index.js";
export declare namespace PrimitiveClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class PrimitiveClient {
    protected readonly _options: NormalizedClientOptionsWithAuth<PrimitiveClient.Options>;
    constructor(options: PrimitiveClient.Options);
    /**
     * @param {string} request
     * @param {PrimitiveClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.exhaustive.endpoints.primitive.getAndReturnString("string")
     */
    getAndReturnString(request: string, requestOptions?: PrimitiveClient.RequestOptions): core.HttpResponsePromise<string>;
    private __getAndReturnString;
    /**
     * @param {number} request
     * @param {PrimitiveClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.exhaustive.endpoints.primitive.getAndReturnInt(1)
     */
    getAndReturnInt(request: number, requestOptions?: PrimitiveClient.RequestOptions): core.HttpResponsePromise<number>;
    private __getAndReturnInt;
    /**
     * @param {number} request
     * @param {PrimitiveClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.exhaustive.endpoints.primitive.getAndReturnLong(1000000)
     */
    getAndReturnLong(request: number, requestOptions?: PrimitiveClient.RequestOptions): core.HttpResponsePromise<number>;
    private __getAndReturnLong;
    /**
     * @param {number} request
     * @param {PrimitiveClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.exhaustive.endpoints.primitive.getAndReturnDouble(1.1)
     */
    getAndReturnDouble(request: number, requestOptions?: PrimitiveClient.RequestOptions): core.HttpResponsePromise<number>;
    private __getAndReturnDouble;
    /**
     * @param {boolean} request
     * @param {PrimitiveClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.exhaustive.endpoints.primitive.getAndReturnBool(true)
     */
    getAndReturnBool(request: boolean, requestOptions?: PrimitiveClient.RequestOptions): core.HttpResponsePromise<boolean>;
    private __getAndReturnBool;
    /**
     * @param {string} request
     * @param {PrimitiveClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.exhaustive.endpoints.primitive.getAndReturnDatetime("2024-01-15T09:30:00Z")
     */
    getAndReturnDatetime(request: string, requestOptions?: PrimitiveClient.RequestOptions): core.HttpResponsePromise<string>;
    private __getAndReturnDatetime;
    /**
     * @param {string} request
     * @param {PrimitiveClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.exhaustive.endpoints.primitive.getAndReturnDate("2023-01-15")
     */
    getAndReturnDate(request: string, requestOptions?: PrimitiveClient.RequestOptions): core.HttpResponsePromise<string>;
    private __getAndReturnDate;
    /**
     * @param {string} request
     * @param {PrimitiveClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.exhaustive.endpoints.primitive.getAndReturnUuid("string")
     */
    getAndReturnUuid(request: string, requestOptions?: PrimitiveClient.RequestOptions): core.HttpResponsePromise<string>;
    private __getAndReturnUuid;
    /**
     * @param {string} request
     * @param {PrimitiveClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.exhaustive.endpoints.primitive.getAndReturnBase64("string")
     */
    getAndReturnBase64(request: string, requestOptions?: PrimitiveClient.RequestOptions): core.HttpResponsePromise<string>;
    private __getAndReturnBase64;
}
