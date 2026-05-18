import type { BaseClientOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../BaseClient.js";
import { ServiceClient } from "../resources/service/client/Client.js";
export declare namespace FileUploadClient {
    type Options = BaseClientOptions;
}
export declare class FileUploadClient {
    protected readonly _options: NormalizedClientOptions<FileUploadClient.Options>;
    protected _service: ServiceClient | undefined;
    constructor(options: FileUploadClient.Options);
    get service(): ServiceClient;
}
