import type { BaseClientOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../BaseClient.mjs";
import { ServiceClient } from "../resources/service/client/Client.mjs";
export declare namespace FileDownloadClient {
    type Options = BaseClientOptions;
}
export declare class FileDownloadClient {
    protected readonly _options: NormalizedClientOptions<FileDownloadClient.Options>;
    protected _service: ServiceClient | undefined;
    constructor(options: FileDownloadClient.Options);
    get service(): ServiceClient;
}
