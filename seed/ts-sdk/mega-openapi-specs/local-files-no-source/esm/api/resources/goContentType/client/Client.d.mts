import type { BaseClientOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../BaseClient.mjs";
import { ImdbClient } from "../resources/imdb/client/Client.mjs";
export declare namespace GoContentTypeClient {
    type Options = BaseClientOptions;
}
export declare class GoContentTypeClient {
    protected readonly _options: NormalizedClientOptions<GoContentTypeClient.Options>;
    protected _imdb: ImdbClient | undefined;
    constructor(options: GoContentTypeClient.Options);
    get imdb(): ImdbClient;
}
