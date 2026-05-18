import type { BaseClientOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptionsWithAuth } from "../../../../BaseClient.js";
import { DummyClient } from "../resources/dummy/client/Client.js";
export declare namespace SingleUrlEnvironmentDefaultClient {
    type Options = BaseClientOptions;
}
export declare class SingleUrlEnvironmentDefaultClient {
    protected readonly _options: NormalizedClientOptionsWithAuth<SingleUrlEnvironmentDefaultClient.Options>;
    protected _dummy: DummyClient | undefined;
    constructor(options: SingleUrlEnvironmentDefaultClient.Options);
    get dummy(): DummyClient;
}
