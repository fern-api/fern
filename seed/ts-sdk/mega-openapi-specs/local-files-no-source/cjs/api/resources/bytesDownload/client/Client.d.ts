import type { BaseClientOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../BaseClient.js";
import { ServiceClient } from "../resources/service/client/Client.js";
export declare namespace BytesDownloadClient {
    type Options = BaseClientOptions;
}
export declare class BytesDownloadClient {
    protected readonly _options: NormalizedClientOptions<BytesDownloadClient.Options>;
    protected _service: ServiceClient | undefined;
    constructor(options: BytesDownloadClient.Options);
    get service(): ServiceClient;
}
