import type { BaseClientOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../BaseClient.mjs";
import { CsharpXmlEntitiesClient as CsharpXmlEntitiesClient_ } from "../resources/csharpXmlEntities/client/Client.mjs";
export declare namespace CsharpXmlEntitiesClient {
    type Options = BaseClientOptions;
}
export declare class CsharpXmlEntitiesClient {
    protected readonly _options: NormalizedClientOptions<CsharpXmlEntitiesClient.Options>;
    protected _csharpXmlEntities: CsharpXmlEntitiesClient_ | undefined;
    constructor(options: CsharpXmlEntitiesClient.Options);
    get csharpXmlEntities(): CsharpXmlEntitiesClient_;
}
