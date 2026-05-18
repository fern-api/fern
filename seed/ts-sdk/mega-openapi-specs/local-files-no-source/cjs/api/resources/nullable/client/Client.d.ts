import type { BaseClientOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../BaseClient.js";
import { NullableClient as NullableClient_ } from "../resources/nullable/client/Client.js";
export declare namespace NullableClient {
    type Options = BaseClientOptions;
}
export declare class NullableClient {
    protected readonly _options: NormalizedClientOptions<NullableClient.Options>;
    protected _nullable: NullableClient_ | undefined;
    constructor(options: NullableClient.Options);
    get nullable(): NullableClient_;
}
