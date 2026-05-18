import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.mjs";
import * as core from "../../../../../../core/index.mjs";
import type * as SeedApi from "../../../../../index.mjs";
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
