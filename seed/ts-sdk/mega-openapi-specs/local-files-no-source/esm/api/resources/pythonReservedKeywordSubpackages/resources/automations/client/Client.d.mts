import type { BaseClientOptions } from "../../../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.mjs";
import { ExportClient } from "../resources/export/client/Client.mjs";
import { ImportClient } from "../resources/import/client/Client.mjs";
export declare namespace AutomationsClient {
    type Options = BaseClientOptions;
}
export declare class AutomationsClient {
    protected readonly _options: NormalizedClientOptions<AutomationsClient.Options>;
    protected _import: ImportClient | undefined;
    protected _export: ExportClient | undefined;
    constructor(options: AutomationsClient.Options);
    get import(): ImportClient;
    get export(): ExportClient;
}
