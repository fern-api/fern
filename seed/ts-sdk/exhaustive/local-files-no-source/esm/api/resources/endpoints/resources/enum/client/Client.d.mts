import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.mjs";
import { type NormalizedClientOptionsWithAuth } from "../../../../../../BaseClient.mjs";
import * as core from "../../../../../../core/index.mjs";
import type * as SeedApi from "../../../../../index.mjs";
export declare namespace EnumClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class EnumClient {
    protected readonly _options: NormalizedClientOptionsWithAuth<EnumClient.Options>;
    constructor(options: EnumClient.Options);
    /**
     * @param {SeedApi.TypesWeatherReport} request
     * @param {EnumClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.enum.getAndReturnEnum("SUNNY")
     */
    getAndReturnEnum(request: SeedApi.TypesWeatherReport, requestOptions?: EnumClient.RequestOptions): core.HttpResponsePromise<SeedApi.TypesWeatherReport>;
    private __getAndReturnEnum;
}
