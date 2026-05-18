import type { BaseClientOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../BaseClient.js";
import { CsharpSystemCollisionClient as CsharpSystemCollisionClient_ } from "../resources/csharpSystemCollision/client/Client.js";
export declare namespace CsharpSystemCollisionClient {
    type Options = BaseClientOptions;
}
export declare class CsharpSystemCollisionClient {
    protected readonly _options: NormalizedClientOptions<CsharpSystemCollisionClient.Options>;
    protected _csharpSystemCollision: CsharpSystemCollisionClient_ | undefined;
    constructor(options: CsharpSystemCollisionClient.Options);
    get csharpSystemCollision(): CsharpSystemCollisionClient_;
}
