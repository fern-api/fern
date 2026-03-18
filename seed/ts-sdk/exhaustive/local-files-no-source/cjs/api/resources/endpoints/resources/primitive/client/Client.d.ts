import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.js";
import { type NormalizedClientOptionsWithAuth } from "../../../../../../BaseClient.js";
import * as core from "../../../../../../core/index.js";
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
     *     await client.endpoints.primitive.getAndReturnString("string")
     */
    getAndReturnString(request: string, requestOptions?: PrimitiveClient.RequestOptions): core.HttpResponsePromise<string>;
    private __getAndReturnString;
    /**
     * Build a standard Fetch `Request` object for the getAndReturnString endpoint. The returned request has auth, headers, query parameters, and body fully resolved — the caller is responsible for sending it.
     */
    buildRequestForGetAndReturnString(request: string, requestOptions?: PrimitiveClient.RequestOptions): Promise<Request>;
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
     * Build a standard Fetch `Request` object for the getAndReturnInt endpoint. The returned request has auth, headers, query parameters, and body fully resolved — the caller is responsible for sending it.
     */
    buildRequestForGetAndReturnInt(request: number, requestOptions?: PrimitiveClient.RequestOptions): Promise<Request>;
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
     * Build a standard Fetch `Request` object for the getAndReturnLong endpoint. The returned request has auth, headers, query parameters, and body fully resolved — the caller is responsible for sending it.
     */
    buildRequestForGetAndReturnLong(request: number, requestOptions?: PrimitiveClient.RequestOptions): Promise<Request>;
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
     * Build a standard Fetch `Request` object for the getAndReturnDouble endpoint. The returned request has auth, headers, query parameters, and body fully resolved — the caller is responsible for sending it.
     */
    buildRequestForGetAndReturnDouble(request: number, requestOptions?: PrimitiveClient.RequestOptions): Promise<Request>;
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
     * Build a standard Fetch `Request` object for the getAndReturnBool endpoint. The returned request has auth, headers, query parameters, and body fully resolved — the caller is responsible for sending it.
     */
    buildRequestForGetAndReturnBool(request: boolean, requestOptions?: PrimitiveClient.RequestOptions): Promise<Request>;
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
     * Build a standard Fetch `Request` object for the getAndReturnDatetime endpoint. The returned request has auth, headers, query parameters, and body fully resolved — the caller is responsible for sending it.
     */
    buildRequestForGetAndReturnDatetime(request: string, requestOptions?: PrimitiveClient.RequestOptions): Promise<Request>;
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
     * Build a standard Fetch `Request` object for the getAndReturnDate endpoint. The returned request has auth, headers, query parameters, and body fully resolved — the caller is responsible for sending it.
     */
    buildRequestForGetAndReturnDate(request: string, requestOptions?: PrimitiveClient.RequestOptions): Promise<Request>;
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
     * Build a standard Fetch `Request` object for the getAndReturnUuid endpoint. The returned request has auth, headers, query parameters, and body fully resolved — the caller is responsible for sending it.
     */
    buildRequestForGetAndReturnUuid(request: string, requestOptions?: PrimitiveClient.RequestOptions): Promise<Request>;
    /**
     * @param {string} request
     * @param {PrimitiveClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.primitive.getAndReturnBase64("SGVsbG8gd29ybGQh")
     */
    getAndReturnBase64(request: string, requestOptions?: PrimitiveClient.RequestOptions): core.HttpResponsePromise<string>;
    private __getAndReturnBase64;
    /**
     * Build a standard Fetch `Request` object for the getAndReturnBase64 endpoint. The returned request has auth, headers, query parameters, and body fully resolved — the caller is responsible for sending it.
     */
    buildRequestForGetAndReturnBase64(request: string, requestOptions?: PrimitiveClient.RequestOptions): Promise<Request>;
}
