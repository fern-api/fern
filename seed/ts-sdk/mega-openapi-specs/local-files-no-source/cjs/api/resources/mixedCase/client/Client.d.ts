import type { BaseClientOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../BaseClient.js";
import { ServiceClient } from "../resources/service/client/Client.js";
export declare namespace MixedCaseClient {
    type Options = BaseClientOptions;
}
export declare class MixedCaseClient {
    protected readonly _options: NormalizedClientOptions<MixedCaseClient.Options>;
    protected _service: ServiceClient | undefined;
    constructor(options: MixedCaseClient.Options);
    get service(): ServiceClient;
}
