import type { BaseClientOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptionsWithAuth } from "../../../../BaseClient.js";
import { ServiceClient } from "../resources/service/client/Client.js";
export declare namespace JavaBuilderExtensionClient {
    type Options = BaseClientOptions;
}
export declare class JavaBuilderExtensionClient {
    protected readonly _options: NormalizedClientOptionsWithAuth<JavaBuilderExtensionClient.Options>;
    protected _service: ServiceClient | undefined;
    constructor(options: JavaBuilderExtensionClient.Options);
    get service(): ServiceClient;
}
