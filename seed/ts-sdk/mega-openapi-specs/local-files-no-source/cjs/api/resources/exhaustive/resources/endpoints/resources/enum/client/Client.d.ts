import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../../../BaseClient.js";
import { type NormalizedClientOptionsWithAuth } from "../../../../../../../../BaseClient.js";
import * as core from "../../../../../../../../core/index.js";
import type * as SeedApi from "../../../../../../../index.js";
export declare namespace EnumClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class EnumClient {
    protected readonly _options: NormalizedClientOptionsWithAuth<EnumClient.Options>;
    constructor(options: EnumClient.Options);
    /**
     * @param {SeedApi.exhaustive.TypesWeatherReport} request
     * @param {EnumClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.exhaustive.endpoints.enum.getAndReturnEnum("SUNNY")
     */
    getAndReturnEnum(request: SeedApi.exhaustive.TypesWeatherReport, requestOptions?: EnumClient.RequestOptions): core.HttpResponsePromise<SeedApi.exhaustive.TypesWeatherReport>;
    private __getAndReturnEnum;
}
