import type { BaseClientOptions } from "../../../../../../BaseClient.js";
import { type NormalizedClientOptionsWithAuth } from "../../../../../../BaseClient.js";
import { NotificationClient } from "../resources/notification/client/Client.js";
import { ServiceClient } from "../resources/service/client/Client.js";
export declare namespace FileClient {
    type Options = BaseClientOptions;
}
export declare class FileClient {
    protected readonly _options: NormalizedClientOptionsWithAuth<FileClient.Options>;
    protected _service: ServiceClient | undefined;
    protected _notification: NotificationClient | undefined;
    constructor(options: FileClient.Options);
    get service(): ServiceClient;
    get notification(): NotificationClient;
}
