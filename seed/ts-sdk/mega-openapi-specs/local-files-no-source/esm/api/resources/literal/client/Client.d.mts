import type { BaseClientOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../BaseClient.mjs";
import { HeadersClient } from "../resources/headers/client/Client.mjs";
import { InlinedClient } from "../resources/inlined/client/Client.mjs";
import { PathClient } from "../resources/path/client/Client.mjs";
import { QueryClient } from "../resources/query/client/Client.mjs";
import { ReferenceClient } from "../resources/reference/client/Client.mjs";
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
