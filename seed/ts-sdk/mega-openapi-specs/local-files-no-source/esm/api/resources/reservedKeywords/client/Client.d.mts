import type { BaseClientOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../BaseClient.mjs";
import { PackageClient } from "../resources/package/client/Client.mjs";
export declare namespace ReservedKeywordsClient {
    type Options = BaseClientOptions;
}
export declare class ReservedKeywordsClient {
    protected readonly _options: NormalizedClientOptions<ReservedKeywordsClient.Options>;
    protected _package: PackageClient | undefined;
    constructor(options: ReservedKeywordsClient.Options);
    get package(): PackageClient;
}
