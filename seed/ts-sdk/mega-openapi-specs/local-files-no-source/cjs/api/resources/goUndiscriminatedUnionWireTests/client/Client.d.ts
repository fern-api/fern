import type { BaseClientOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../BaseClient.js";
import { ServiceClient } from "../resources/service/client/Client.js";
export declare namespace GoUndiscriminatedUnionWireTestsClient {
    type Options = BaseClientOptions;
}
export declare class GoUndiscriminatedUnionWireTestsClient {
    protected readonly _options: NormalizedClientOptions<GoUndiscriminatedUnionWireTestsClient.Options>;
    protected _service: ServiceClient | undefined;
    constructor(options: GoUndiscriminatedUnionWireTestsClient.Options);
    get service(): ServiceClient;
}
