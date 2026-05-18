import type { BaseClientOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../BaseClient.js";
import { ServiceClient } from "../resources/service/client/Client.js";
export declare namespace JavaOutputDirectoryClient {
    type Options = BaseClientOptions;
}
export declare class JavaOutputDirectoryClient {
    protected readonly _options: NormalizedClientOptions<JavaOutputDirectoryClient.Options>;
    protected _service: ServiceClient | undefined;
    constructor(options: JavaOutputDirectoryClient.Options);
    get service(): ServiceClient;
}
