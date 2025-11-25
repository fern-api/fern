import { EndpointsClient } from "./api/resources/endpoints/client/Client.mjs";
import { InlinedRequestsClient } from "./api/resources/inlinedRequests/client/Client.mjs";
import { NoAuthClient } from "./api/resources/noAuth/client/Client.mjs";
import { NoReqBodyClient } from "./api/resources/noReqBody/client/Client.mjs";
import { ReqWithHeadersClient } from "./api/resources/reqWithHeaders/client/Client.mjs";
import type { BaseClientOptions, BaseRequestOptions } from "./BaseClient.mjs";
import { type NormalizedClientOptionsWithAuth } from "./BaseClient.mjs";
export declare namespace SeedExhaustiveClient {
    interface Options extends BaseClientOptions {
    }
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class SeedExhaustiveClient {
    protected readonly _options: NormalizedClientOptionsWithAuth<SeedExhaustiveClient.Options>;
    protected _endpoints: EndpointsClient | undefined;
    protected _inlinedRequests: InlinedRequestsClient | undefined;
    protected _noAuth: NoAuthClient | undefined;
    protected _noReqBody: NoReqBodyClient | undefined;
    protected _reqWithHeaders: ReqWithHeadersClient | undefined;
    constructor(options: SeedExhaustiveClient.Options);
    get endpoints(): EndpointsClient;
    get inlinedRequests(): InlinedRequestsClient;
    get noAuth(): NoAuthClient;
    get noReqBody(): NoReqBodyClient;
    get reqWithHeaders(): ReqWithHeadersClient;
}
