import type { BaseClientOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../BaseClient.js";
import { DummyClient } from "../resources/dummy/client/Client.js";
export declare namespace JavaStreamingAcceptHeaderClient {
    type Options = BaseClientOptions;
}
export declare class JavaStreamingAcceptHeaderClient {
    protected readonly _options: NormalizedClientOptions<JavaStreamingAcceptHeaderClient.Options>;
    protected _dummy: DummyClient | undefined;
    constructor(options: JavaStreamingAcceptHeaderClient.Options);
    get dummy(): DummyClient;
}
