import type { BaseClientOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../BaseClient.js";
import { CsharpPropertyNameCollisionClient as CsharpPropertyNameCollisionClient_ } from "../resources/csharpPropertyNameCollision/client/Client.js";
export declare namespace CsharpPropertyNameCollisionClient {
    type Options = BaseClientOptions;
}
export declare class CsharpPropertyNameCollisionClient {
    protected readonly _options: NormalizedClientOptions<CsharpPropertyNameCollisionClient.Options>;
    protected _csharpPropertyNameCollision: CsharpPropertyNameCollisionClient_ | undefined;
    constructor(options: CsharpPropertyNameCollisionClient.Options);
    get csharpPropertyNameCollision(): CsharpPropertyNameCollisionClient_;
}
