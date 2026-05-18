import type { BaseClientOptions } from "../../../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.mjs";
import { ServiceClient } from "../resources/service/client/Client.mjs";
export declare namespace FolderAClient {
    type Options = BaseClientOptions;
}
export declare class FolderAClient {
    protected readonly _options: NormalizedClientOptions<FolderAClient.Options>;
    protected _service: ServiceClient | undefined;
    constructor(options: FolderAClient.Options);
    get service(): ServiceClient;
}
