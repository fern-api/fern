import type { BaseClientOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../BaseClient.js";
import { DummyClient } from "../resources/dummy/client/Client.js";
export declare namespace StreamingClient {
    type Options = BaseClientOptions;
}
export declare class StreamingClient {
    protected readonly _options: NormalizedClientOptions<StreamingClient.Options>;
    protected _dummy: DummyClient | undefined;
    constructor(options: StreamingClient.Options);
    get dummy(): DummyClient;
}
