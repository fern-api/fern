import { EndpointsContainerClient } from "./api/resources/endpointsContainer/client/Client.js";
import { EndpointsContentTypeClient } from "./api/resources/endpointsContentType/client/Client.js";
import { EndpointsEnumClient } from "./api/resources/endpointsEnum/client/Client.js";
import { EndpointsHttpMethodsClient } from "./api/resources/endpointsHttpMethods/client/Client.js";
import { EndpointsObjectClient } from "./api/resources/endpointsObject/client/Client.js";
import { EndpointsPaginationClient } from "./api/resources/endpointsPagination/client/Client.js";
import { EndpointsParamsClient } from "./api/resources/endpointsParams/client/Client.js";
import { EndpointsPrimitiveClient } from "./api/resources/endpointsPrimitive/client/Client.js";
import { EndpointsPutClient } from "./api/resources/endpointsPut/client/Client.js";
import { EndpointsUnionClient } from "./api/resources/endpointsUnion/client/Client.js";
import { EndpointsUrLsClient } from "./api/resources/endpointsUrLs/client/Client.js";
import { InlinedrequestsClient } from "./api/resources/inlinedrequests/client/Client.js";
import { NoauthClient } from "./api/resources/noauth/client/Client.js";
import { NoreqbodyClient } from "./api/resources/noreqbody/client/Client.js";
import { ReqwithheadersClient } from "./api/resources/reqwithheaders/client/Client.js";
import type { BaseClientOptions, BaseRequestOptions } from "./BaseClient.js";
import { type NormalizedClientOptionsWithAuth } from "./BaseClient.js";
import * as core from "./core/index.js";
export declare namespace SeedApiClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class SeedApiClient {
    protected readonly _options: NormalizedClientOptionsWithAuth<SeedApiClient.Options>;
    protected _endpointsContainer: EndpointsContainerClient | undefined;
    protected _endpointsContentType: EndpointsContentTypeClient | undefined;
    protected _endpointsEnum: EndpointsEnumClient | undefined;
    protected _endpointsHttpMethods: EndpointsHttpMethodsClient | undefined;
    protected _endpointsObject: EndpointsObjectClient | undefined;
    protected _endpointsPagination: EndpointsPaginationClient | undefined;
    protected _endpointsParams: EndpointsParamsClient | undefined;
    protected _endpointsPrimitive: EndpointsPrimitiveClient | undefined;
    protected _endpointsPut: EndpointsPutClient | undefined;
    protected _endpointsUnion: EndpointsUnionClient | undefined;
    protected _endpointsUrLs: EndpointsUrLsClient | undefined;
    protected _inlinedrequests: InlinedrequestsClient | undefined;
    protected _noauth: NoauthClient | undefined;
    protected _noreqbody: NoreqbodyClient | undefined;
    protected _reqwithheaders: ReqwithheadersClient | undefined;
    constructor(options: SeedApiClient.Options);
    get endpointsContainer(): EndpointsContainerClient;
    get endpointsContentType(): EndpointsContentTypeClient;
    get endpointsEnum(): EndpointsEnumClient;
    get endpointsHttpMethods(): EndpointsHttpMethodsClient;
    get endpointsObject(): EndpointsObjectClient;
    get endpointsPagination(): EndpointsPaginationClient;
    get endpointsParams(): EndpointsParamsClient;
    get endpointsPrimitive(): EndpointsPrimitiveClient;
    get endpointsPut(): EndpointsPutClient;
    get endpointsUnion(): EndpointsUnionClient;
    get endpointsUrLs(): EndpointsUrLsClient;
    get inlinedrequests(): InlinedrequestsClient;
    get noauth(): NoauthClient;
    get noreqbody(): NoreqbodyClient;
    get reqwithheaders(): ReqwithheadersClient;
    /**
     * Make a passthrough request using the SDK's configured auth, retry, logging, etc.
     * This is useful for making requests to endpoints not yet supported in the SDK.
     * The input can be a URL string, URL object, or Request object. Relative paths are resolved against the configured base URL.
     *
     * @param {Request | string | URL} input - The URL, path, or Request object.
     * @param {RequestInit} init - Standard fetch RequestInit options.
     * @param {core.PassthroughRequest.RequestOptions} requestOptions - Per-request overrides (timeout, retries, headers, abort signal).
     * @returns {Promise<Response>} A standard Response object.
     */
    fetch(input: Request | string | URL, init?: RequestInit, requestOptions?: core.PassthroughRequest.RequestOptions): Promise<Response>;
}
