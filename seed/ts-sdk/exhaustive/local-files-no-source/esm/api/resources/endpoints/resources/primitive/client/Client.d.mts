import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.mjs";
import * as core from "../../../../../../core/index.mjs";
export declare namespace Primitive {
    interface Options extends BaseClientOptions {
    }
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class Primitive {
    protected readonly _options: Primitive.Options;
    constructor(_options: Primitive.Options);
    /**
     * @param {string} request
     * @param {Primitive.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.primitive.getAndReturnString("string")
     */
    getAndReturnString(request: string, requestOptions?: Primitive.RequestOptions): core.HttpResponsePromise<string>;
    private __getAndReturnString;
    /**
     * @param {number} request
     * @param {Primitive.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.primitive.getAndReturnInt(1)
     */
    getAndReturnInt(request: number, requestOptions?: Primitive.RequestOptions): core.HttpResponsePromise<number>;
    private __getAndReturnInt;
    /**
     * @param {number} request
     * @param {Primitive.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.primitive.getAndReturnLong(1000000)
     */
    getAndReturnLong(request: number, requestOptions?: Primitive.RequestOptions): core.HttpResponsePromise<number>;
    private __getAndReturnLong;
    /**
     * @param {number} request
     * @param {Primitive.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.primitive.getAndReturnDouble(1.1)
     */
    getAndReturnDouble(request: number, requestOptions?: Primitive.RequestOptions): core.HttpResponsePromise<number>;
    private __getAndReturnDouble;
    /**
     * @param {boolean} request
     * @param {Primitive.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.primitive.getAndReturnBool(true)
     */
    getAndReturnBool(request: boolean, requestOptions?: Primitive.RequestOptions): core.HttpResponsePromise<boolean>;
    private __getAndReturnBool;
    /**
     * @param {string} request
     * @param {Primitive.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.primitive.getAndReturnDatetime("2024-01-15T09:30:00Z")
     */
    getAndReturnDatetime(request: string, requestOptions?: Primitive.RequestOptions): core.HttpResponsePromise<string>;
    private __getAndReturnDatetime;
    /**
     * @param {string} request
     * @param {Primitive.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.primitive.getAndReturnDate("2023-01-15")
     */
    getAndReturnDate(request: string, requestOptions?: Primitive.RequestOptions): core.HttpResponsePromise<string>;
    private __getAndReturnDate;
    /**
     * @param {string} request
     * @param {Primitive.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.primitive.getAndReturnUuid("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32")
     */
    getAndReturnUuid(request: string, requestOptions?: Primitive.RequestOptions): core.HttpResponsePromise<string>;
    private __getAndReturnUuid;
    /**
     * @param {string} request
     * @param {Primitive.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.primitive.getAndReturnBase64("SGVsbG8gd29ybGQh")
     */
    getAndReturnBase64(request: string, requestOptions?: Primitive.RequestOptions): core.HttpResponsePromise<string>;
    private __getAndReturnBase64;
    protected _getAuthorizationHeader(): Promise<string | undefined>;
}
