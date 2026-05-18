import type { BaseClientOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../BaseClient.mjs";
import { PropertyBasedErrorClient } from "../resources/propertyBasedError/client/Client.mjs";
export declare namespace ErrorPropertyClient {
    type Options = BaseClientOptions;
}
export declare class ErrorPropertyClient {
    protected readonly _options: NormalizedClientOptions<ErrorPropertyClient.Options>;
    protected _propertyBasedError: PropertyBasedErrorClient | undefined;
    constructor(options: ErrorPropertyClient.Options);
    get propertyBasedError(): PropertyBasedErrorClient;
}
