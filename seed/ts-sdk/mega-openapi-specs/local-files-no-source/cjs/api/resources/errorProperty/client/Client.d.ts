import type { BaseClientOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../BaseClient.js";
import { PropertyBasedErrorClient } from "../resources/propertyBasedError/client/Client.js";
export declare namespace ErrorPropertyClient {
    type Options = BaseClientOptions;
}
export declare class ErrorPropertyClient {
    protected readonly _options: NormalizedClientOptions<ErrorPropertyClient.Options>;
    protected _propertyBasedError: PropertyBasedErrorClient | undefined;
    constructor(options: ErrorPropertyClient.Options);
    get propertyBasedError(): PropertyBasedErrorClient;
}
