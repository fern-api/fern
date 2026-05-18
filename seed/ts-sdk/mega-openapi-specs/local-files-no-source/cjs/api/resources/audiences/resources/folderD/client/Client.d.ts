import type { BaseClientOptions } from "../../../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.js";
import { ServiceClient } from "../resources/service/client/Client.js";
export declare namespace FolderDClient {
    type Options = BaseClientOptions;
}
export declare class FolderDClient {
    protected readonly _options: NormalizedClientOptions<FolderDClient.Options>;
    protected _service: ServiceClient | undefined;
    constructor(options: FolderDClient.Options);
    get service(): ServiceClient;
}
