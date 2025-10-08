import { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.mjs";
import * as core from "../../../../../../core/index.mjs";
import * as SeedExhaustive from "../../../../../index.mjs";
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
     * @param {SeedExhaustive.types.WeatherReport} request
     * @param {Enum.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.enum.getAndReturnEnum("SUNNY")
     */
    getAndReturnEnum(request: SeedExhaustive.types.WeatherReport, requestOptions?: Enum.RequestOptions): core.HttpResponsePromise<SeedExhaustive.types.WeatherReport>;
    private __getAndReturnEnum;
    protected _getAuthorizationHeader(): Promise<string | undefined>;
}
