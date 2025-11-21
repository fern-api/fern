import type { BaseClientOptions, BaseRequestOptions } from "../../../../BaseClient.js";
import * as core from "../../../../core/index.js";
import type { ObjectWithOptionalField } from "../../types/resources/object/types/ObjectWithOptionalField.js";
export declare namespace NoReqBodyClient {
    interface Options extends BaseClientOptions {
    }
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class NoReqBodyClient {
    protected readonly _options: NoReqBodyClient.Options;
    constructor(options: NoReqBodyClient.Options);
    /**
     * @param {NoReqBodyClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.noReqBody.getWithNoRequestBody()
     */
    getWithNoRequestBody(requestOptions?: NoReqBodyClient.RequestOptions): core.HttpResponsePromise<ObjectWithOptionalField>;
    private __getWithNoRequestBody;
    /**
     * @param {NoReqBodyClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.noReqBody.postWithNoRequestBody()
     */
    postWithNoRequestBody(requestOptions?: NoReqBodyClient.RequestOptions): core.HttpResponsePromise<string>;
    private __postWithNoRequestBody;
    protected _getAuthorizationHeader(): Promise<string | undefined>;
}
