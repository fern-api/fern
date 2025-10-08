import { BaseClientOptions, BaseRequestOptions } from "./BaseClient.mjs";
import { Endpoints } from "./api/resources/endpoints/client/Client.mjs";
import { InlinedRequests } from "./api/resources/inlinedRequests/client/Client.mjs";
import { NoAuth } from "./api/resources/noAuth/client/Client.mjs";
import { NoReqBody } from "./api/resources/noReqBody/client/Client.mjs";
import { ReqWithHeaders } from "./api/resources/reqWithHeaders/client/Client.mjs";
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
