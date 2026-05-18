import type { BaseClientOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../BaseClient.mjs";
import { PropertyAccessClient as PropertyAccessClient_ } from "../resources/propertyAccess/client/Client.mjs";
export declare namespace PropertyAccessClient {
    type Options = BaseClientOptions;
}
export declare class PropertyAccessClient {
    protected readonly _options: NormalizedClientOptions<PropertyAccessClient.Options>;
    protected _propertyAccess: PropertyAccessClient_ | undefined;
    constructor(options: PropertyAccessClient.Options);
    get propertyAccess(): PropertyAccessClient_;
}
