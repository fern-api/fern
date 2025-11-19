import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.js";
import * as core from "../../../../../../core/index.js";
import type { WeatherReport } from "../../../../types/resources/enum/types/WeatherReport.js";
export declare namespace EnumClient {
    interface Options extends BaseClientOptions {
    }
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class EnumClient {
    protected readonly _options: EnumClient.Options;
    constructor(options: EnumClient.Options);
    /**
     * @param {WeatherReport} request
     * @param {EnumClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.enum.getAndReturnEnum("SUNNY")
     */
    getAndReturnEnum(request: WeatherReport, requestOptions?: EnumClient.RequestOptions): core.HttpResponsePromise<WeatherReport>;
    private __getAndReturnEnum;
    protected _getAuthorizationHeader(): Promise<string | undefined>;
}
