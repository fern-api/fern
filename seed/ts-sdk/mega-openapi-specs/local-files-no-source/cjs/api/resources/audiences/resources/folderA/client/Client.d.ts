import type { BaseClientOptions } from "../../../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.js";
import { ServiceClient } from "../resources/service/client/Client.js";
export declare namespace FolderAClient {
    type Options = BaseClientOptions;
}
export declare class FolderAClient {
    protected readonly _options: NormalizedClientOptions<FolderAClient.Options>;
    protected _service: ServiceClient | undefined;
    constructor(options: FolderAClient.Options);
    get service(): ServiceClient;
}
