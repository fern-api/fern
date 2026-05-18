import type { BaseClientOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../BaseClient.mjs";
import { ServiceClient } from "../resources/service/client/Client.mjs";
export declare namespace FileUploadClient {
    type Options = BaseClientOptions;
}
export declare class FileUploadClient {
    protected readonly _options: NormalizedClientOptions<FileUploadClient.Options>;
    protected _service: ServiceClient | undefined;
    constructor(options: FileUploadClient.Options);
    get service(): ServiceClient;
}
