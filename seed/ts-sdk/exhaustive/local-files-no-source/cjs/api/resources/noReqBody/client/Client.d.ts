import type { BaseClientOptions, BaseRequestOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptionsWithAuth } from "../../../../BaseClient.js";
import * as core from "../../../../core/index.js";
import type * as SeedExhaustive from "../../../index.js";
export declare namespace NoReqBodyClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class NoReqBodyClient {
    protected readonly _options: NormalizedClientOptionsWithAuth<NoReqBodyClient.Options>;
    constructor(options: NoReqBodyClient.Options);
    /**
     * @param {NoReqBodyClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.noReqBody.getWithNoRequestBody()
     */
    getWithNoRequestBody(requestOptions?: NoReqBodyClient.RequestOptions): core.HttpResponsePromise<SeedExhaustive.types.ObjectWithOptionalField>;
    private __getWithNoRequestBody;
    /**
     * Build a standard Fetch `Request` object for the getWithNoRequestBody endpoint. The returned request has auth, headers, query parameters, and body fully resolved — the caller is responsible for sending it.
     */
    buildRequestForGetWithNoRequestBody(requestOptions?: NoReqBodyClient.RequestOptions): Promise<Request>;
    /**
     * @param {NoReqBodyClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.noReqBody.postWithNoRequestBody()
     */
    postWithNoRequestBody(requestOptions?: NoReqBodyClient.RequestOptions): core.HttpResponsePromise<string>;
    private __postWithNoRequestBody;
    /**
     * Build a standard Fetch `Request` object for the postWithNoRequestBody endpoint. The returned request has auth, headers, query parameters, and body fully resolved — the caller is responsible for sending it.
     */
    buildRequestForPostWithNoRequestBody(requestOptions?: NoReqBodyClient.RequestOptions): Promise<Request>;
}
