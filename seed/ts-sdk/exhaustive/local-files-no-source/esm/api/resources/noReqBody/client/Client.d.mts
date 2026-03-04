import type { BaseClientOptions, BaseRequestOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptionsWithAuth } from "../../../../BaseClient.mjs";
import * as core from "../../../../core/index.mjs";
import type * as SeedExhaustive from "../../../index.mjs";
export declare namespace NoReqBodyClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class NoReqBodyClient {
    protected readonly _options: NormalizedClientOptionsWithAuth<NoReqBodyClient.Options>;
    protected readonly _requestFn: core.RequestFn;
    constructor(options: NoReqBodyClient.Options);
    constructor(options: NoReqBodyClient.Options, requestFn: core.RequestFn);
    /**
     * @param {NoReqBodyClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.noReqBody.getWithNoRequestBody()
     */
    getWithNoRequestBody(requestOptions?: NoReqBodyClient.RequestOptions): core.HttpResponsePromise<SeedExhaustive.types.ObjectWithOptionalField>;
    /**
     * @param {NoReqBodyClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.noReqBody.postWithNoRequestBody()
     */
    postWithNoRequestBody(requestOptions?: NoReqBodyClient.RequestOptions): core.HttpResponsePromise<string>;
}
