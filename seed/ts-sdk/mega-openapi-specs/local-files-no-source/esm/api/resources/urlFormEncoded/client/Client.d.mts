import type { BaseClientOptions, BaseRequestOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../BaseClient.mjs";
import * as core from "../../../../core/index.mjs";
import type * as SeedApi from "../../../index.mjs";
export declare namespace UrlFormEncodedClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class UrlFormEncodedClient {
    protected readonly _options: NormalizedClientOptions<UrlFormEncodedClient.Options>;
    constructor(options: UrlFormEncodedClient.Options);
    /**
     * @param {SeedApi.urlFormEncoded.PostSubmitRequest} request
     * @param {UrlFormEncodedClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.urlFormEncoded.submitFormData({
     *         username: "johndoe",
     *         email: "john@example.com"
     *     })
     */
    submitFormData(request: SeedApi.urlFormEncoded.PostSubmitRequest, requestOptions?: UrlFormEncodedClient.RequestOptions): core.HttpResponsePromise<SeedApi.urlFormEncoded.PostSubmitResponse>;
    private __submitFormData;
    /**
     * @param {SeedApi.urlFormEncoded.TokenRequest} request
     * @param {UrlFormEncodedClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.urlFormEncoded.getToken({
     *         client_id: "client_id",
     *         client_secret: "client_secret"
     *     })
     */
    getToken(request: SeedApi.urlFormEncoded.TokenRequest, requestOptions?: UrlFormEncodedClient.RequestOptions): core.HttpResponsePromise<SeedApi.urlFormEncoded.TokenResponse>;
    private __getToken;
}
