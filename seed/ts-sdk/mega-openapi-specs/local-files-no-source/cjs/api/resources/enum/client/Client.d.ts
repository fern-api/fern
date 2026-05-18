import type { BaseClientOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../BaseClient.js";
import { HeadersClient } from "../resources/headers/client/Client.js";
import { InlinedRequestClient } from "../resources/inlinedRequest/client/Client.js";
import { MultipartFormClient } from "../resources/multipartForm/client/Client.js";
import { PathParamClient } from "../resources/pathParam/client/Client.js";
import { QueryParamClient } from "../resources/queryParam/client/Client.js";
export declare namespace EnumClient {
    type Options = BaseClientOptions;
}
export declare class EnumClient {
    protected readonly _options: NormalizedClientOptions<EnumClient.Options>;
    protected _headers: HeadersClient | undefined;
    protected _inlinedRequest: InlinedRequestClient | undefined;
    protected _multipartForm: MultipartFormClient | undefined;
    protected _pathParam: PathParamClient | undefined;
    protected _queryParam: QueryParamClient | undefined;
    constructor(options: EnumClient.Options);
    get headers(): HeadersClient;
    get inlinedRequest(): InlinedRequestClient;
    get multipartForm(): MultipartFormClient;
    get pathParam(): PathParamClient;
    get queryParam(): QueryParamClient;
}
