import type { BaseClientOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../BaseClient.js";
import { HeadersClient } from "../resources/headers/client/Client.js";
import { InlinedClient } from "../resources/inlined/client/Client.js";
import { PathClient } from "../resources/path/client/Client.js";
import { QueryClient } from "../resources/query/client/Client.js";
import { ReferenceClient } from "../resources/reference/client/Client.js";
export declare namespace LiteralClient {
    type Options = BaseClientOptions;
}
export declare class LiteralClient {
    protected readonly _options: NormalizedClientOptions<LiteralClient.Options>;
    protected _headers: HeadersClient | undefined;
    protected _inlined: InlinedClient | undefined;
    protected _path: PathClient | undefined;
    protected _query: QueryClient | undefined;
    protected _reference: ReferenceClient | undefined;
    constructor(options: LiteralClient.Options);
    get headers(): HeadersClient;
    get inlined(): InlinedClient;
    get path(): PathClient;
    get query(): QueryClient;
    get reference(): ReferenceClient;
}
