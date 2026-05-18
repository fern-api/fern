import type { BaseClientOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../BaseClient.mjs";
import { ServiceClient } from "../resources/service/client/Client.mjs";
export declare namespace BytesUploadClient {
    type Options = BaseClientOptions;
}
export declare class BytesUploadClient {
    protected readonly _options: NormalizedClientOptions<BytesUploadClient.Options>;
    protected _service: ServiceClient | undefined;
    constructor(options: BytesUploadClient.Options);
    get service(): ServiceClient;
}
