import type { BaseClientOptions } from "../../../../../../../../BaseClient.js";
import { type NormalizedClientOptionsWithAuth } from "../../../../../../../../BaseClient.js";
import { ServiceClient } from "../resources/service/client/Client.js";
export declare namespace NotificationClient {
    type Options = BaseClientOptions;
}
export declare class NotificationClient {
    protected readonly _options: NormalizedClientOptionsWithAuth<NotificationClient.Options>;
    protected _service: ServiceClient | undefined;
    constructor(options: NotificationClient.Options);
    get service(): ServiceClient;
}
