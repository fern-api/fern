import type { BaseClientOptions, BaseRequestOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptionsWithAuth } from "../../../../BaseClient.js";
import * as core from "../../../../core/index.js";
export declare namespace EndpointsPrimitiveClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class EndpointsPrimitiveClient {
    protected readonly _options: NormalizedClientOptionsWithAuth<EndpointsPrimitiveClient.Options>;
    constructor(options: EndpointsPrimitiveClient.Options);
    /**
     * @param {string} request
     * @param {EndpointsPrimitiveClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpointsPrimitive.endpointsPrimitiveGetAndReturnString("string")
     */
    endpointsPrimitiveGetAndReturnString(request: string, requestOptions?: EndpointsPrimitiveClient.RequestOptions): core.HttpResponsePromise<string>;
    private __endpointsPrimitiveGetAndReturnString;
    /**
     * @param {number} request
     * @param {EndpointsPrimitiveClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpointsPrimitive.endpointsPrimitiveGetAndReturnInt(1)
     */
    endpointsPrimitiveGetAndReturnInt(request: number, requestOptions?: EndpointsPrimitiveClient.RequestOptions): core.HttpResponsePromise<number>;
    private __endpointsPrimitiveGetAndReturnInt;
    /**
     * @param {number} request
     * @param {EndpointsPrimitiveClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpointsPrimitive.endpointsPrimitiveGetAndReturnLong(1000000)
     */
    endpointsPrimitiveGetAndReturnLong(request: number, requestOptions?: EndpointsPrimitiveClient.RequestOptions): core.HttpResponsePromise<number>;
    private __endpointsPrimitiveGetAndReturnLong;
    /**
     * @param {number} request
     * @param {EndpointsPrimitiveClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpointsPrimitive.endpointsPrimitiveGetAndReturnDouble(1.1)
     */
    endpointsPrimitiveGetAndReturnDouble(request: number, requestOptions?: EndpointsPrimitiveClient.RequestOptions): core.HttpResponsePromise<number>;
    private __endpointsPrimitiveGetAndReturnDouble;
    /**
     * @param {boolean} request
     * @param {EndpointsPrimitiveClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpointsPrimitive.endpointsPrimitiveGetAndReturnBool(true)
     */
    endpointsPrimitiveGetAndReturnBool(request: boolean, requestOptions?: EndpointsPrimitiveClient.RequestOptions): core.HttpResponsePromise<boolean>;
    private __endpointsPrimitiveGetAndReturnBool;
    /**
     * @param {string} request
     * @param {EndpointsPrimitiveClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpointsPrimitive.endpointsPrimitiveGetAndReturnDatetime("2024-01-15T09:30:00Z")
     */
    endpointsPrimitiveGetAndReturnDatetime(request: string, requestOptions?: EndpointsPrimitiveClient.RequestOptions): core.HttpResponsePromise<string>;
    private __endpointsPrimitiveGetAndReturnDatetime;
    /**
     * @param {string} request
     * @param {EndpointsPrimitiveClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpointsPrimitive.endpointsPrimitiveGetAndReturnDate("2023-01-15")
     */
    endpointsPrimitiveGetAndReturnDate(request: string, requestOptions?: EndpointsPrimitiveClient.RequestOptions): core.HttpResponsePromise<string>;
    private __endpointsPrimitiveGetAndReturnDate;
    /**
     * @param {string} request
     * @param {EndpointsPrimitiveClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpointsPrimitive.endpointsPrimitiveGetAndReturnUuid("string")
     */
    endpointsPrimitiveGetAndReturnUuid(request: string, requestOptions?: EndpointsPrimitiveClient.RequestOptions): core.HttpResponsePromise<string>;
    private __endpointsPrimitiveGetAndReturnUuid;
    /**
     * @param {string} request
     * @param {EndpointsPrimitiveClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpointsPrimitive.endpointsPrimitiveGetAndReturnBase64("string")
     */
    endpointsPrimitiveGetAndReturnBase64(request: string, requestOptions?: EndpointsPrimitiveClient.RequestOptions): core.HttpResponsePromise<string>;
    private __endpointsPrimitiveGetAndReturnBase64;
}
