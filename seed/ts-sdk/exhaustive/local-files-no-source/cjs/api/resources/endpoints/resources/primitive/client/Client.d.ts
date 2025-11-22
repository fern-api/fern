import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.js";
import * as core from "../../../../../../core/index.js";
export declare namespace PrimitiveClient {
    interface Options extends BaseClientOptions {
    }
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class PrimitiveClient {
    protected readonly _options: PrimitiveClient.Options;
    constructor(options: PrimitiveClient.Options);
    /**
     * @param {string} request
     * @param {PrimitiveClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.primitive.getAndReturnString("string")
     */
    getAndReturnString(request: string, requestOptions?: PrimitiveClient.RequestOptions): core.HttpResponsePromise<string>;
    private __getAndReturnString;
    /**
     * @param {number} request
     * @param {PrimitiveClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.primitive.getAndReturnInt(1)
     */
    getAndReturnInt(request: number, requestOptions?: PrimitiveClient.RequestOptions): core.HttpResponsePromise<number>;
    private __getAndReturnInt;
    /**
     * @param {number} request
     * @param {PrimitiveClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.primitive.getAndReturnLong(1000000)
     */
    getAndReturnLong(request: number, requestOptions?: PrimitiveClient.RequestOptions): core.HttpResponsePromise<number>;
    private __getAndReturnLong;
    /**
     * @param {number} request
     * @param {PrimitiveClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.primitive.getAndReturnDouble(1.1)
     */
    getAndReturnDouble(request: number, requestOptions?: PrimitiveClient.RequestOptions): core.HttpResponsePromise<number>;
    private __getAndReturnDouble;
    /**
     * @param {boolean} request
     * @param {PrimitiveClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.primitive.getAndReturnBool(true)
     */
    getAndReturnBool(request: boolean, requestOptions?: PrimitiveClient.RequestOptions): core.HttpResponsePromise<boolean>;
    private __getAndReturnBool;
    /**
     * @param {string} request
     * @param {PrimitiveClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.primitive.getAndReturnDatetime("2024-01-15T09:30:00Z")
     */
    getAndReturnDatetime(request: string, requestOptions?: PrimitiveClient.RequestOptions): core.HttpResponsePromise<string>;
    private __getAndReturnDatetime;
    /**
     * @param {string} request
     * @param {PrimitiveClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.primitive.getAndReturnDate("2023-01-15")
     */
    getAndReturnDate(request: string, requestOptions?: PrimitiveClient.RequestOptions): core.HttpResponsePromise<string>;
    private __getAndReturnDate;
    /**
     * @param {string} request
     * @param {PrimitiveClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.primitive.getAndReturnUuid("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32")
     */
    getAndReturnUuid(request: string, requestOptions?: PrimitiveClient.RequestOptions): core.HttpResponsePromise<string>;
    private __getAndReturnUuid;
    /**
     * @param {string} request
     * @param {PrimitiveClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.primitive.getAndReturnBase64("SGVsbG8gd29ybGQh")
     */
    getAndReturnBase64(request: string, requestOptions?: PrimitiveClient.RequestOptions): core.HttpResponsePromise<string>;
    private __getAndReturnBase64;
    protected _getAuthorizationHeader(): Promise<string | undefined>;
}
