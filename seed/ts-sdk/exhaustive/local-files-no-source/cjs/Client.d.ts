import { BaseClientOptions, BaseRequestOptions } from "./BaseClient.js";
import { Endpoints } from "./api/resources/endpoints/client/Client.js";
import { InlinedRequests } from "./api/resources/inlinedRequests/client/Client.js";
import { NoAuth } from "./api/resources/noAuth/client/Client.js";
import { NoReqBody } from "./api/resources/noReqBody/client/Client.js";
import { ReqWithHeaders } from "./api/resources/reqWithHeaders/client/Client.js";
export declare namespace SeedExhaustiveClient {
    interface Options extends BaseClientOptions {
    }
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class SeedExhaustiveClient {
    protected readonly _options: SeedExhaustiveClient.Options;
    protected _endpoints: Endpoints | undefined;
    protected _inlinedRequests: InlinedRequests | undefined;
    protected _noAuth: NoAuth | undefined;
    protected _noReqBody: NoReqBody | undefined;
    protected _reqWithHeaders: ReqWithHeaders | undefined;
    constructor(_options: SeedExhaustiveClient.Options);
    get endpoints(): Endpoints;
    get inlinedRequests(): InlinedRequests;
    get noAuth(): NoAuth;
    get noReqBody(): NoReqBody;
    get reqWithHeaders(): ReqWithHeaders;
}
