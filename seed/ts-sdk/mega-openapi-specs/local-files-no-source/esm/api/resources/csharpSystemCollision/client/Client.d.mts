import type { BaseClientOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../BaseClient.mjs";
import { CsharpSystemCollisionClient as CsharpSystemCollisionClient_ } from "../resources/csharpSystemCollision/client/Client.mjs";
export declare namespace CsharpSystemCollisionClient {
    type Options = BaseClientOptions;
}
export declare class CsharpSystemCollisionClient {
    protected readonly _options: NormalizedClientOptions<CsharpSystemCollisionClient.Options>;
    protected _csharpSystemCollision: CsharpSystemCollisionClient_ | undefined;
    constructor(options: CsharpSystemCollisionClient.Options);
    get csharpSystemCollision(): CsharpSystemCollisionClient_;
}
