import type { BaseClientOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../BaseClient.mjs";
import { ServiceClient } from "../resources/service/client/Client.mjs";
export declare namespace GoUndiscriminatedUnionWireTestsClient {
    type Options = BaseClientOptions;
}
export declare class GoUndiscriminatedUnionWireTestsClient {
    protected readonly _options: NormalizedClientOptions<GoUndiscriminatedUnionWireTestsClient.Options>;
    protected _service: ServiceClient | undefined;
    constructor(options: GoUndiscriminatedUnionWireTestsClient.Options);
    get service(): ServiceClient;
}
