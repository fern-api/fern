import type { BaseClientOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../BaseClient.mjs";
import { NullableOptionalClient as NullableOptionalClient_ } from "../resources/nullableOptional/client/Client.mjs";
export declare namespace NullableOptionalClient {
    type Options = BaseClientOptions;
}
export declare class NullableOptionalClient {
    protected readonly _options: NormalizedClientOptions<NullableOptionalClient.Options>;
    protected _nullableOptional: NullableOptionalClient_ | undefined;
    constructor(options: NullableOptionalClient.Options);
    get nullableOptional(): NullableOptionalClient_;
}
