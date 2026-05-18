import type { BaseClientOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../BaseClient.js";
import { PackageClient } from "../resources/package/client/Client.js";
export declare namespace ReservedKeywordsClient {
    type Options = BaseClientOptions;
}
export declare class ReservedKeywordsClient {
    protected readonly _options: NormalizedClientOptions<ReservedKeywordsClient.Options>;
    protected _package: PackageClient | undefined;
    constructor(options: ReservedKeywordsClient.Options);
    get package(): PackageClient;
}
