import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.js";
import * as core from "../../../../../../core/index.js";
import type * as SeedApi from "../../../../../index.js";
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
