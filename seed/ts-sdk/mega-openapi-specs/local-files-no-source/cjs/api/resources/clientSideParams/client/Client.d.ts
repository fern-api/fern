import type { BaseClientOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../BaseClient.js";
import { ServiceClient } from "../resources/service/client/Client.js";
export declare namespace ClientSideParamsClient {
    type Options = BaseClientOptions;
}
export declare class ClientSideParamsClient {
    protected readonly _options: NormalizedClientOptions<ClientSideParamsClient.Options>;
    protected _service: ServiceClient | undefined;
    constructor(options: ClientSideParamsClient.Options);
    get service(): ServiceClient;
}
