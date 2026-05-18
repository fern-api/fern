import type { BaseClientOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../BaseClient.mjs";
import { RequiredNullableClient as RequiredNullableClient_ } from "../resources/requiredNullable/client/Client.mjs";
export declare namespace RequiredNullableClient {
    type Options = BaseClientOptions;
}
export declare class RequiredNullableClient {
    protected readonly _options: NormalizedClientOptions<RequiredNullableClient.Options>;
    protected _requiredNullable: RequiredNullableClient_ | undefined;
    constructor(options: RequiredNullableClient.Options);
    get requiredNullable(): RequiredNullableClient_;
}
