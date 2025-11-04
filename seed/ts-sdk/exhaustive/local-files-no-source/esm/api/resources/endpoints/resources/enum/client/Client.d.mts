import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.mjs";
import * as core from "../../../../../../core/index.mjs";
import type { WeatherReport } from "../../../../types/resources/enum/types/WeatherReport.mjs";
export declare namespace Enum {
    interface Options extends BaseClientOptions {
    }
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class Enum {
    protected readonly _options: Enum.Options;
    constructor(_options: Enum.Options);
    /**
     * @param {WeatherReport} request
     * @param {Enum.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.enum.getAndReturnEnum("SUNNY")
     */
    getAndReturnEnum(request: WeatherReport, requestOptions?: Enum.RequestOptions): core.HttpResponsePromise<WeatherReport>;
    private __getAndReturnEnum;
    protected _getAuthorizationHeader(): Promise<string | undefined>;
}
