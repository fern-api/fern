import type { BaseClientOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../BaseClient.js";
import { DummyClient } from "../resources/dummy/client/Client.js";
export declare namespace StreamingParameterClient {
    type Options = BaseClientOptions;
}
export declare class StreamingParameterClient {
    protected readonly _options: NormalizedClientOptions<StreamingParameterClient.Options>;
    protected _dummy: DummyClient | undefined;
    constructor(options: StreamingParameterClient.Options);
    get dummy(): DummyClient;
}
