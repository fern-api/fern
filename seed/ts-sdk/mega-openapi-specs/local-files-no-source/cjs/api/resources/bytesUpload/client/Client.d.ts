import type { BaseClientOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../BaseClient.js";
import { ServiceClient } from "../resources/service/client/Client.js";
export declare namespace BytesUploadClient {
    type Options = BaseClientOptions;
}
export declare class BytesUploadClient {
    protected readonly _options: NormalizedClientOptions<BytesUploadClient.Options>;
    protected _service: ServiceClient | undefined;
    constructor(options: BytesUploadClient.Options);
    get service(): ServiceClient;
}
