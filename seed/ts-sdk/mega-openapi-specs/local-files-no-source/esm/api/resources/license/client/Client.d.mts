import type { BaseClientOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../BaseClient.mjs";
import { LicenseClient as LicenseClient_ } from "../resources/license/client/Client.mjs";
export declare namespace LicenseClient {
    type Options = BaseClientOptions;
}
export declare class LicenseClient {
    protected readonly _options: NormalizedClientOptions<LicenseClient.Options>;
    protected _license: LicenseClient_ | undefined;
    constructor(options: LicenseClient.Options);
    get license(): LicenseClient_;
}
