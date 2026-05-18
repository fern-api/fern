import type { BaseClientOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../BaseClient.mjs";
import { ImdbClient as ImdbClient_ } from "../resources/imdb/client/Client.mjs";
export declare namespace ImdbClient {
    type Options = BaseClientOptions;
}
export declare class ImdbClient {
    protected readonly _options: NormalizedClientOptions<ImdbClient.Options>;
    protected _imdb: ImdbClient_ | undefined;
    constructor(options: ImdbClient.Options);
    get imdb(): ImdbClient_;
}
