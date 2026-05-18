import type { BaseClientOptions } from "../../../../../../../../BaseClient.mjs";
import { type NormalizedClientOptionsWithAuth } from "../../../../../../../../BaseClient.mjs";
import { ServiceClient } from "../resources/service/client/Client.mjs";
export declare namespace NotificationClient {
    type Options = BaseClientOptions;
}
export declare class NotificationClient {
    protected readonly _options: NormalizedClientOptionsWithAuth<NotificationClient.Options>;
    protected _service: ServiceClient | undefined;
    constructor(options: NotificationClient.Options);
    get service(): ServiceClient;
}
