import type { BaseClientOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../BaseClient.mjs";
import { ServiceClient } from "../resources/service/client/Client.mjs";
export declare namespace RubyReservedWordPropertiesClient {
    type Options = BaseClientOptions;
}
export declare class RubyReservedWordPropertiesClient {
    protected readonly _options: NormalizedClientOptions<RubyReservedWordPropertiesClient.Options>;
    protected _service: ServiceClient | undefined;
    constructor(options: RubyReservedWordPropertiesClient.Options);
    get service(): ServiceClient;
}
