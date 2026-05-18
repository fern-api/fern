import type { BaseClientOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../BaseClient.mjs";
import { ServiceClient } from "../resources/service/client/Client.mjs";
export declare namespace JavaOutputDirectoryClient {
    type Options = BaseClientOptions;
}
export declare class JavaOutputDirectoryClient {
    protected readonly _options: NormalizedClientOptions<JavaOutputDirectoryClient.Options>;
    protected _service: ServiceClient | undefined;
    constructor(options: JavaOutputDirectoryClient.Options);
    get service(): ServiceClient;
}
