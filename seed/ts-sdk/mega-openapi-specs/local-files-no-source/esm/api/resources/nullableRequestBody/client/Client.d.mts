import type { BaseClientOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../BaseClient.mjs";
import { TestGroupClient } from "../resources/testGroup/client/Client.mjs";
export declare namespace NullableRequestBodyClient {
    type Options = BaseClientOptions;
}
export declare class NullableRequestBodyClient {
    protected readonly _options: NormalizedClientOptions<NullableRequestBodyClient.Options>;
    protected _testGroup: TestGroupClient | undefined;
    constructor(options: NullableRequestBodyClient.Options);
    get testGroup(): TestGroupClient;
}
