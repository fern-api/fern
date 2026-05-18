import type { BaseClientOptions } from "../../../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.js";
import { ExportClient } from "../resources/export/client/Client.js";
import { ImportClient } from "../resources/import/client/Client.js";
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
