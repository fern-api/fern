import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.js";
import * as core from "../../../../../../core/index.js";
import type * as SeedApi from "../../../../../index.js";
export declare namespace CsharpXmlEntitiesClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class CsharpXmlEntitiesClient {
    protected readonly _options: NormalizedClientOptions<CsharpXmlEntitiesClient.Options>;
    constructor(options: CsharpXmlEntitiesClient.Options);
    /**
     * Get timezone information with &plus; offset
     *
     * @param {CsharpXmlEntitiesClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.csharpXmlEntities.csharpXmlEntities.getTimeZone()
     */
    getTimeZone(requestOptions?: CsharpXmlEntitiesClient.RequestOptions): core.HttpResponsePromise<SeedApi.csharpXmlEntities.TimeZoneModel>;
    private __getTimeZone;
}
