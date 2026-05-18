import type { BaseClientOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../BaseClient.mjs";
import { ServiceClient } from "../resources/service/client/Client.mjs";
export declare namespace ClientSideParamsClient {
    type Options = BaseClientOptions;
}
export declare class ClientSideParamsClient {
    protected readonly _options: NormalizedClientOptions<ClientSideParamsClient.Options>;
    protected _service: ServiceClient | undefined;
    constructor(options: ClientSideParamsClient.Options);
    get service(): ServiceClient;
}
