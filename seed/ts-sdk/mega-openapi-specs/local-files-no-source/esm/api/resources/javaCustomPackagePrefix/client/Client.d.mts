import type { BaseClientOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../BaseClient.mjs";
import { ImdbClient } from "../resources/imdb/client/Client.mjs";
export declare namespace JavaCustomPackagePrefixClient {
    type Options = BaseClientOptions;
}
export declare class JavaCustomPackagePrefixClient {
    protected readonly _options: NormalizedClientOptions<JavaCustomPackagePrefixClient.Options>;
    protected _imdb: ImdbClient | undefined;
    constructor(options: JavaCustomPackagePrefixClient.Options);
    get imdb(): ImdbClient;
}
