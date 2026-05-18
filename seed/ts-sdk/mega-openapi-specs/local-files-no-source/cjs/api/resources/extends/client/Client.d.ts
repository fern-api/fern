import type { BaseClientOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../BaseClient.js";
import { ExtendsClient as ExtendsClient_ } from "../resources/extends/client/Client.js";
export declare namespace ExtendsClient {
    type Options = BaseClientOptions;
}
export declare class ExtendsClient {
    protected readonly _options: NormalizedClientOptions<ExtendsClient.Options>;
    protected _extends: ExtendsClient_ | undefined;
    constructor(options: ExtendsClient.Options);
    get extends(): ExtendsClient_;
}
