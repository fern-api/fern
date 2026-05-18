import type { BaseClientOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../BaseClient.mjs";
import { ServiceClient } from "../resources/service/client/Client.mjs";
export declare namespace BytesDownloadClient {
    type Options = BaseClientOptions;
}
export declare class BytesDownloadClient {
    protected readonly _options: NormalizedClientOptions<BytesDownloadClient.Options>;
    protected _service: ServiceClient | undefined;
    constructor(options: BytesDownloadClient.Options);
    get service(): ServiceClient;
}
