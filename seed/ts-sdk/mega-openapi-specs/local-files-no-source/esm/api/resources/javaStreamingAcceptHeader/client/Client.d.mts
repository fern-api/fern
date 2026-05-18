import type { BaseClientOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../BaseClient.mjs";
import { DummyClient } from "../resources/dummy/client/Client.mjs";
export declare namespace JavaStreamingAcceptHeaderClient {
    type Options = BaseClientOptions;
}
export declare class JavaStreamingAcceptHeaderClient {
    protected readonly _options: NormalizedClientOptions<JavaStreamingAcceptHeaderClient.Options>;
    protected _dummy: DummyClient | undefined;
    constructor(options: JavaStreamingAcceptHeaderClient.Options);
    get dummy(): DummyClient;
}
