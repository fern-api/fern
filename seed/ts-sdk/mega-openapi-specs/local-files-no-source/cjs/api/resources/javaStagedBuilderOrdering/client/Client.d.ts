import type { BaseClientOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../BaseClient.js";
import { ServiceClient } from "../resources/service/client/Client.js";
export declare namespace JavaStagedBuilderOrderingClient {
    type Options = BaseClientOptions;
}
export declare class JavaStagedBuilderOrderingClient {
    protected readonly _options: NormalizedClientOptions<JavaStagedBuilderOrderingClient.Options>;
    protected _service: ServiceClient | undefined;
    constructor(options: JavaStagedBuilderOrderingClient.Options);
    get service(): ServiceClient;
}
