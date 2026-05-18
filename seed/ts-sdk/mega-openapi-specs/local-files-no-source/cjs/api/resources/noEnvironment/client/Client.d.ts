import type { BaseClientOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptionsWithAuth } from "../../../../BaseClient.js";
import { DummyClient } from "../resources/dummy/client/Client.js";
export declare namespace NoEnvironmentClient {
    type Options = BaseClientOptions;
}
export declare class NoEnvironmentClient {
    protected readonly _options: NormalizedClientOptionsWithAuth<NoEnvironmentClient.Options>;
    protected _dummy: DummyClient | undefined;
    constructor(options: NoEnvironmentClient.Options);
    get dummy(): DummyClient;
}
