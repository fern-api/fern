import type { BaseClientOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../BaseClient.mjs";
import { ServiceClient } from "../resources/service/client/Client.mjs";
export declare namespace JavaStagedBuilderOrderingClient {
    type Options = BaseClientOptions;
}
export declare class JavaStagedBuilderOrderingClient {
    protected readonly _options: NormalizedClientOptions<JavaStagedBuilderOrderingClient.Options>;
    protected _service: ServiceClient | undefined;
    constructor(options: JavaStagedBuilderOrderingClient.Options);
    get service(): ServiceClient;
}
