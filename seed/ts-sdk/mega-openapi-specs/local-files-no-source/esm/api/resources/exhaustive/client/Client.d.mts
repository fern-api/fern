import type { BaseClientOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptionsWithAuth } from "../../../../BaseClient.mjs";
import { EndpointsClient } from "../resources/endpoints/client/Client.mjs";
import { EndpointsHttpMethodsClient } from "../resources/endpointsHttpMethods/client/Client.mjs";
import { EndpointsUrLsClient } from "../resources/endpointsUrLs/client/Client.mjs";
import { InlinedRequestsClient } from "../resources/inlinedRequests/client/Client.mjs";
import { NoAuthClient } from "../resources/noAuth/client/Client.mjs";
import { NoReqBodyClient } from "../resources/noReqBody/client/Client.mjs";
import { ReqWithHeadersClient } from "../resources/reqWithHeaders/client/Client.mjs";
export declare namespace ExhaustiveClient {
    type Options = BaseClientOptions;
}
export declare class ExhaustiveClient {
    protected readonly _options: NormalizedClientOptionsWithAuth<ExhaustiveClient.Options>;
    protected _endpointsHttpMethods: EndpointsHttpMethodsClient | undefined;
    protected _endpointsUrLs: EndpointsUrLsClient | undefined;
    protected _inlinedRequests: InlinedRequestsClient | undefined;
    protected _noAuth: NoAuthClient | undefined;
    protected _noReqBody: NoReqBodyClient | undefined;
    protected _reqWithHeaders: ReqWithHeadersClient | undefined;
    protected _endpoints: EndpointsClient | undefined;
    constructor(options: ExhaustiveClient.Options);
    get endpointsHttpMethods(): EndpointsHttpMethodsClient;
    get endpointsUrLs(): EndpointsUrLsClient;
    get inlinedRequests(): InlinedRequestsClient;
    get noAuth(): NoAuthClient;
    get noReqBody(): NoReqBodyClient;
    get reqWithHeaders(): ReqWithHeadersClient;
    get endpoints(): EndpointsClient;
}
