import type { BaseClientOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../BaseClient.js";
import { ImdbClient } from "../resources/imdb/client/Client.js";
export declare namespace GoContentTypeClient {
    type Options = BaseClientOptions;
}
export declare class GoContentTypeClient {
    protected readonly _options: NormalizedClientOptions<GoContentTypeClient.Options>;
    protected _imdb: ImdbClient | undefined;
    constructor(options: GoContentTypeClient.Options);
    get imdb(): ImdbClient;
}
