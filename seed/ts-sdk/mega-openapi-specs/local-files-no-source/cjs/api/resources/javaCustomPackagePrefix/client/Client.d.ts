import type { BaseClientOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../BaseClient.js";
import { ImdbClient } from "../resources/imdb/client/Client.js";
export declare namespace JavaCustomPackagePrefixClient {
    type Options = BaseClientOptions;
}
export declare class JavaCustomPackagePrefixClient {
    protected readonly _options: NormalizedClientOptions<JavaCustomPackagePrefixClient.Options>;
    protected _imdb: ImdbClient | undefined;
    constructor(options: JavaCustomPackagePrefixClient.Options);
    get imdb(): ImdbClient;
}
