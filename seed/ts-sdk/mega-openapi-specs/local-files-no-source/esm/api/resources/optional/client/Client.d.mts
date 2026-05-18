import type { BaseClientOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../BaseClient.mjs";
import { OptionalClient as OptionalClient_ } from "../resources/optional/client/Client.mjs";
export declare namespace OptionalClient {
    type Options = BaseClientOptions;
}
export declare class OptionalClient {
    protected readonly _options: NormalizedClientOptions<OptionalClient.Options>;
    protected _optional: OptionalClient_ | undefined;
    constructor(options: OptionalClient.Options);
    get optional(): OptionalClient_;
}
