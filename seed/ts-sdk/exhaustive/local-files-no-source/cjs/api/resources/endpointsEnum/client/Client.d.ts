import type { BaseClientOptions, BaseRequestOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptionsWithAuth } from "../../../../BaseClient.js";
import * as core from "../../../../core/index.js";
import type * as SeedApi from "../../../index.js";
export declare namespace EndpointsEnumClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class EndpointsEnumClient {
    protected readonly _options: NormalizedClientOptionsWithAuth<EndpointsEnumClient.Options>;
    constructor(options: EndpointsEnumClient.Options);
    /**
     * @param {SeedApi.TypesWeatherReport} request
     * @param {EndpointsEnumClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpointsEnum.endpointsEnumGetAndReturnEnum("SUNNY")
     */
    endpointsEnumGetAndReturnEnum(request: SeedApi.TypesWeatherReport, requestOptions?: EndpointsEnumClient.RequestOptions): core.HttpResponsePromise<SeedApi.TypesWeatherReport>;
    private __endpointsEnumGetAndReturnEnum;
}
