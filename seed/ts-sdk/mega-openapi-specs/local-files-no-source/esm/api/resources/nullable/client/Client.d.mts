import type { BaseClientOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../BaseClient.mjs";
import { NullableClient as NullableClient_ } from "../resources/nullable/client/Client.mjs";
export declare namespace NullableClient {
    type Options = BaseClientOptions;
}
export declare class NullableClient {
    protected readonly _options: NormalizedClientOptions<NullableClient.Options>;
    protected _nullable: NullableClient_ | undefined;
    constructor(options: NullableClient.Options);
    get nullable(): NullableClient_;
}
