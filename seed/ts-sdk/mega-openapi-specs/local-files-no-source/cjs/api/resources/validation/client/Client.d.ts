import type { BaseClientOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../BaseClient.js";
import { ValidationClient as ValidationClient_ } from "../resources/validation/client/Client.js";
export declare namespace ValidationClient {
    type Options = BaseClientOptions;
}
export declare class ValidationClient {
    protected readonly _options: NormalizedClientOptions<ValidationClient.Options>;
    protected _validation: ValidationClient_ | undefined;
    constructor(options: ValidationClient.Options);
    get validation(): ValidationClient_;
}
