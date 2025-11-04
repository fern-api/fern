import type { BaseClientOptions, BaseRequestOptions } from "../../../../BaseClient.mjs";
import * as core from "../../../../core/index.mjs";
import type { ObjectWithOptionalField } from "../../types/resources/object/types/ObjectWithOptionalField.mjs";
export declare namespace NoReqBody {
    interface Options extends BaseClientOptions {
    }
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class NoReqBody {
    protected readonly _options: NoReqBody.Options;
    constructor(_options: NoReqBody.Options);
    /**
     * @param {NoReqBody.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.noReqBody.getWithNoRequestBody()
     */
    getWithNoRequestBody(requestOptions?: NoReqBody.RequestOptions): core.HttpResponsePromise<ObjectWithOptionalField>;
    private __getWithNoRequestBody;
    /**
     * @param {NoReqBody.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.noReqBody.postWithNoRequestBody()
     */
    postWithNoRequestBody(requestOptions?: NoReqBody.RequestOptions): core.HttpResponsePromise<string>;
    private __postWithNoRequestBody;
    protected _getAuthorizationHeader(): Promise<string | undefined>;
}
