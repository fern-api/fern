import type { BaseClientOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../BaseClient.mjs";
import { HeadersClient } from "../resources/headers/client/Client.mjs";
import { InlinedRequestClient } from "../resources/inlinedRequest/client/Client.mjs";
import { MultipartFormClient } from "../resources/multipartForm/client/Client.mjs";
import { PathParamClient } from "../resources/pathParam/client/Client.mjs";
import { QueryParamClient } from "../resources/queryParam/client/Client.mjs";
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
