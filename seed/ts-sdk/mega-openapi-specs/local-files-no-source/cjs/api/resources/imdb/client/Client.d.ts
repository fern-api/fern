import type { BaseClientOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../BaseClient.js";
import { ImdbClient as ImdbClient_ } from "../resources/imdb/client/Client.js";
export declare namespace ImdbClient {
    type Options = BaseClientOptions;
}
export declare class ImdbClient {
    protected readonly _options: NormalizedClientOptions<ImdbClient.Options>;
    protected _imdb: ImdbClient_ | undefined;
    constructor(options: ImdbClient.Options);
    get imdb(): ImdbClient_;
}
