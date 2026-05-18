import type { BaseClientOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../BaseClient.js";
import { OptionalClient as OptionalClient_ } from "../resources/optional/client/Client.js";
export declare namespace OptionalClient {
    type Options = BaseClientOptions;
}
export declare class OptionalClient {
    protected readonly _options: NormalizedClientOptions<OptionalClient.Options>;
    protected _optional: OptionalClient_ | undefined;
    constructor(options: OptionalClient.Options);
    get optional(): OptionalClient_;
}
