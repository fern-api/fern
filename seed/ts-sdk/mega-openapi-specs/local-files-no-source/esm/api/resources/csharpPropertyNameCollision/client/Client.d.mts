import type { BaseClientOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../BaseClient.mjs";
import { CsharpPropertyNameCollisionClient as CsharpPropertyNameCollisionClient_ } from "../resources/csharpPropertyNameCollision/client/Client.mjs";
export declare namespace CsharpPropertyNameCollisionClient {
    type Options = BaseClientOptions;
}
export declare class CsharpPropertyNameCollisionClient {
    protected readonly _options: NormalizedClientOptions<CsharpPropertyNameCollisionClient.Options>;
    protected _csharpPropertyNameCollision: CsharpPropertyNameCollisionClient_ | undefined;
    constructor(options: CsharpPropertyNameCollisionClient.Options);
    get csharpPropertyNameCollision(): CsharpPropertyNameCollisionClient_;
}
