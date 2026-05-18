import type { BaseClientOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../BaseClient.mjs";
import { SinglePropertyClient } from "../resources/singleProperty/client/Client.mjs";
export declare namespace JavaSinglePropertyEndpointClient {
    type Options = BaseClientOptions;
}
export declare class JavaSinglePropertyEndpointClient {
    protected readonly _options: NormalizedClientOptions<JavaSinglePropertyEndpointClient.Options>;
    protected _singleProperty: SinglePropertyClient | undefined;
    constructor(options: JavaSinglePropertyEndpointClient.Options);
    get singleProperty(): SinglePropertyClient;
}
