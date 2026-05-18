import type { BaseClientOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../BaseClient.mjs";
import { ValidationClient as ValidationClient_ } from "../resources/validation/client/Client.mjs";
export declare namespace ValidationClient {
    type Options = BaseClientOptions;
}
export declare class ValidationClient {
    protected readonly _options: NormalizedClientOptions<ValidationClient.Options>;
    protected _validation: ValidationClient_ | undefined;
    constructor(options: ValidationClient.Options);
    get validation(): ValidationClient_;
}
