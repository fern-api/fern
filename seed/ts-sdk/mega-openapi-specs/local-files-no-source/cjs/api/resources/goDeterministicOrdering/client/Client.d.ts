import type { BaseClientOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptionsWithAuth } from "../../../../BaseClient.js";
import { EndpointsClient } from "../resources/endpoints/client/Client.js";
import { EndpointsHttpMethodsClient } from "../resources/endpointsHttpMethods/client/Client.js";
import { EndpointsUrLsClient } from "../resources/endpointsUrLs/client/Client.js";
import { InlinedRequestsClient } from "../resources/inlinedRequests/client/Client.js";
import { NoAuthClient } from "../resources/noAuth/client/Client.js";
import { NoReqBodyClient } from "../resources/noReqBody/client/Client.js";
import { ReqWithHeadersClient } from "../resources/reqWithHeaders/client/Client.js";
export declare namespace GoDeterministicOrderingClient {
    type Options = BaseClientOptions;
}
export declare class GoDeterministicOrderingClient {
    protected readonly _options: NormalizedClientOptionsWithAuth<GoDeterministicOrderingClient.Options>;
    protected _endpointsHttpMethods: EndpointsHttpMethodsClient | undefined;
    protected _endpointsUrLs: EndpointsUrLsClient | undefined;
    protected _inlinedRequests: InlinedRequestsClient | undefined;
    protected _noAuth: NoAuthClient | undefined;
    protected _noReqBody: NoReqBodyClient | undefined;
    protected _reqWithHeaders: ReqWithHeadersClient | undefined;
    protected _endpoints: EndpointsClient | undefined;
    constructor(options: GoDeterministicOrderingClient.Options);
    get endpointsHttpMethods(): EndpointsHttpMethodsClient;
    get endpointsUrLs(): EndpointsUrLsClient;
    get inlinedRequests(): InlinedRequestsClient;
    get noAuth(): NoAuthClient;
    get noReqBody(): NoReqBodyClient;
    get reqWithHeaders(): ReqWithHeadersClient;
    get endpoints(): EndpointsClient;
}
