import type { BaseClientOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../BaseClient.mjs";
import { ImdbClient } from "../resources/imdb/client/Client.mjs";
export declare namespace TsExpressCasingClient {
    type Options = BaseClientOptions;
}
export declare class TsExpressCasingClient {
    protected readonly _options: NormalizedClientOptions<TsExpressCasingClient.Options>;
    protected _imdb: ImdbClient | undefined;
    constructor(options: TsExpressCasingClient.Options);
    get imdb(): ImdbClient;
}
