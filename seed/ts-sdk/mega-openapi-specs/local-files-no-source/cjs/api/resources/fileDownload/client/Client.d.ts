import type { BaseClientOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../BaseClient.js";
import { ServiceClient } from "../resources/service/client/Client.js";
export declare namespace FileDownloadClient {
    type Options = BaseClientOptions;
}
export declare class FileDownloadClient {
    protected readonly _options: NormalizedClientOptions<FileDownloadClient.Options>;
    protected _service: ServiceClient | undefined;
    constructor(options: FileDownloadClient.Options);
    get service(): ServiceClient;
}
