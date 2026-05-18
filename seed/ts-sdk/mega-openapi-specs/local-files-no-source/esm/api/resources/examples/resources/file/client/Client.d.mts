import type { BaseClientOptions } from "../../../../../../BaseClient.mjs";
import { type NormalizedClientOptionsWithAuth } from "../../../../../../BaseClient.mjs";
import { NotificationClient } from "../resources/notification/client/Client.mjs";
import { ServiceClient } from "../resources/service/client/Client.mjs";
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
