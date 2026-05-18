import type { BaseClientOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../BaseClient.js";
import { UnknownClient as UnknownClient_ } from "../resources/unknown/client/Client.js";
export declare namespace UnknownClient {
    type Options = BaseClientOptions;
}
export declare class UnknownClient {
    protected readonly _options: NormalizedClientOptions<UnknownClient.Options>;
    protected _unknown: UnknownClient_ | undefined;
    constructor(options: UnknownClient.Options);
    get unknown(): UnknownClient_;
}
