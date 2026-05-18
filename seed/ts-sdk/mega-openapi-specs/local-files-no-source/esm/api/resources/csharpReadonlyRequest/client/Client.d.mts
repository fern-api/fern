import type { BaseClientOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../BaseClient.mjs";
import { CsharpReadonlyRequestClient as CsharpReadonlyRequestClient_ } from "../resources/csharpReadonlyRequest/client/Client.mjs";
export declare namespace CsharpReadonlyRequestClient {
    type Options = BaseClientOptions;
}
export declare class CsharpReadonlyRequestClient {
    protected readonly _options: NormalizedClientOptions<CsharpReadonlyRequestClient.Options>;
    protected _csharpReadonlyRequest: CsharpReadonlyRequestClient_ | undefined;
    constructor(options: CsharpReadonlyRequestClient.Options);
    get csharpReadonlyRequest(): CsharpReadonlyRequestClient_;
}
