import type { BaseClientOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../BaseClient.js";
import { LicenseClient as LicenseClient_ } from "../resources/license/client/Client.js";
export declare namespace LicenseClient {
    type Options = BaseClientOptions;
}
export declare class LicenseClient {
    protected readonly _options: NormalizedClientOptions<LicenseClient.Options>;
    protected _license: LicenseClient_ | undefined;
    constructor(options: LicenseClient.Options);
    get license(): LicenseClient_;
}
