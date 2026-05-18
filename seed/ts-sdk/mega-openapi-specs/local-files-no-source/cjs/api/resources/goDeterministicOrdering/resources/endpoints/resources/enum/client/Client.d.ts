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
     * @param {SeedApi.goDeterministicOrdering.TypesWeatherReport} request
     * @param {EnumClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.goDeterministicOrdering.endpoints.enum.getAndReturnEnum("SUNNY")
     */
    getAndReturnEnum(request: SeedApi.goDeterministicOrdering.TypesWeatherReport, requestOptions?: EnumClient.RequestOptions): core.HttpResponsePromise<SeedApi.goDeterministicOrdering.TypesWeatherReport>;
    private __getAndReturnEnum;
}
