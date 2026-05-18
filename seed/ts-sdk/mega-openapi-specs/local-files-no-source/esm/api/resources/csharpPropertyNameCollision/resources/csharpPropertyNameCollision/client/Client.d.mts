import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.mjs";
import * as core from "../../../../../../core/index.mjs";
import type * as SeedApi from "../../../../../index.mjs";
export declare namespace CsharpPropertyNameCollisionClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class CsharpPropertyNameCollisionClient {
    protected readonly _options: NormalizedClientOptions<CsharpPropertyNameCollisionClient.Options>;
    constructor(options: CsharpPropertyNameCollisionClient.Options);
    /**
     * @param {SeedApi.csharpPropertyNameCollision.CatalogV1Id} request
     * @param {CsharpPropertyNameCollisionClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.csharpPropertyNameCollision.csharpPropertyNameCollision.createCatalog({})
     */
    createCatalog(request: SeedApi.csharpPropertyNameCollision.CatalogV1Id, requestOptions?: CsharpPropertyNameCollisionClient.RequestOptions): core.HttpResponsePromise<SeedApi.csharpPropertyNameCollision.CatalogV1Id>;
    private __createCatalog;
    /**
     * @param {SeedApi.csharpPropertyNameCollision.Activity} request
     * @param {CsharpPropertyNameCollisionClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.csharpPropertyNameCollision.csharpPropertyNameCollision.createActivity({})
     */
    createActivity(request: SeedApi.csharpPropertyNameCollision.Activity, requestOptions?: CsharpPropertyNameCollisionClient.RequestOptions): core.HttpResponsePromise<SeedApi.csharpPropertyNameCollision.Activity>;
    private __createActivity;
}
