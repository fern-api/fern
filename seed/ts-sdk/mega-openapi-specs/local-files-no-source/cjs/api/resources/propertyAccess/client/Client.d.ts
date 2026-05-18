import type { BaseClientOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../BaseClient.js";
import { PropertyAccessClient as PropertyAccessClient_ } from "../resources/propertyAccess/client/Client.js";
export declare namespace PropertyAccessClient {
    type Options = BaseClientOptions;
}
export declare class PropertyAccessClient {
    protected readonly _options: NormalizedClientOptions<PropertyAccessClient.Options>;
    protected _propertyAccess: PropertyAccessClient_ | undefined;
    constructor(options: PropertyAccessClient.Options);
    get propertyAccess(): PropertyAccessClient_;
}
