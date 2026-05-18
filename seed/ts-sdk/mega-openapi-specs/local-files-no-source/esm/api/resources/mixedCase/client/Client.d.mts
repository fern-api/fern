import type { BaseClientOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../BaseClient.mjs";
import { ServiceClient } from "../resources/service/client/Client.mjs";
export declare namespace MixedCaseClient {
    type Options = BaseClientOptions;
}
export declare class MixedCaseClient {
    protected readonly _options: NormalizedClientOptions<MixedCaseClient.Options>;
    protected _service: ServiceClient | undefined;
    constructor(options: MixedCaseClient.Options);
    get service(): ServiceClient;
}
