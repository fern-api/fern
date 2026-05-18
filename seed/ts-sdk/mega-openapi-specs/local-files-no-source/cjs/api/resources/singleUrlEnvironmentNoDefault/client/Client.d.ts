import type { BaseClientOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptionsWithAuth } from "../../../../BaseClient.js";
import { DummyClient } from "../resources/dummy/client/Client.js";
export declare namespace SingleUrlEnvironmentNoDefaultClient {
    type Options = BaseClientOptions;
}
export declare class SingleUrlEnvironmentNoDefaultClient {
    protected readonly _options: NormalizedClientOptionsWithAuth<SingleUrlEnvironmentNoDefaultClient.Options>;
    protected _dummy: DummyClient | undefined;
    constructor(options: SingleUrlEnvironmentNoDefaultClient.Options);
    get dummy(): DummyClient;
}
