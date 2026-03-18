import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.js";
import { type NormalizedClientOptionsWithAuth } from "../../../../../../BaseClient.js";
import * as core from "../../../../../../core/index.js";
import type * as SeedExhaustive from "../../../../../index.js";
export declare namespace EnumClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class EnumClient {
    protected readonly _options: NormalizedClientOptionsWithAuth<EnumClient.Options>;
    constructor(options: EnumClient.Options);
    /**
     * @param {SeedExhaustive.types.WeatherReport} request
     * @param {EnumClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.enum.getAndReturnEnum("SUNNY")
     */
    getAndReturnEnum(request: SeedExhaustive.types.WeatherReport, requestOptions?: EnumClient.RequestOptions): core.HttpResponsePromise<SeedExhaustive.types.WeatherReport>;
    private __getAndReturnEnum;
    /**
     * Build a standard Fetch `Request` object for the getAndReturnEnum endpoint. The returned request has auth, headers, query parameters, and body fully resolved — the caller is responsible for sending it.
     */
    buildRequestForGetAndReturnEnum(request: SeedExhaustive.types.WeatherReport, requestOptions?: EnumClient.RequestOptions): Promise<Request>;
}
