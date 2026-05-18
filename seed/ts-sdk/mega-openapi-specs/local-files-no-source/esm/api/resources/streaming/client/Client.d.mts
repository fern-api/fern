import type { BaseClientOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../BaseClient.mjs";
import { DummyClient } from "../resources/dummy/client/Client.mjs";
export declare namespace StreamingClient {
    type Options = BaseClientOptions;
}
export declare class StreamingClient {
    protected readonly _options: NormalizedClientOptions<StreamingClient.Options>;
    protected _dummy: DummyClient | undefined;
    constructor(options: StreamingClient.Options);
    get dummy(): DummyClient;
}
