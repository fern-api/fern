import type { BaseClientOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../BaseClient.js";
import { TestGroupClient } from "../resources/testGroup/client/Client.js";
export declare namespace NullableRequestBodyClient {
    type Options = BaseClientOptions;
}
export declare class NullableRequestBodyClient {
    protected readonly _options: NormalizedClientOptions<NullableRequestBodyClient.Options>;
    protected _testGroup: TestGroupClient | undefined;
    constructor(options: NullableRequestBodyClient.Options);
    get testGroup(): TestGroupClient;
}
