import type { BaseClientOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../BaseClient.js";
import { ImdbClient } from "../resources/imdb/client/Client.js";
export declare namespace TsExpressCasingClient {
    type Options = BaseClientOptions;
}
export declare class TsExpressCasingClient {
    protected readonly _options: NormalizedClientOptions<TsExpressCasingClient.Options>;
    protected _imdb: ImdbClient | undefined;
    constructor(options: TsExpressCasingClient.Options);
    get imdb(): ImdbClient;
}
