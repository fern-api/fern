import type { BaseClientOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../BaseClient.js";
import { NullableOptionalClient as NullableOptionalClient_ } from "../resources/nullableOptional/client/Client.js";
export declare namespace NullableOptionalClient {
    type Options = BaseClientOptions;
}
export declare class NullableOptionalClient {
    protected readonly _options: NormalizedClientOptions<NullableOptionalClient.Options>;
    protected _nullableOptional: NullableOptionalClient_ | undefined;
    constructor(options: NullableOptionalClient.Options);
    get nullableOptional(): NullableOptionalClient_;
}
