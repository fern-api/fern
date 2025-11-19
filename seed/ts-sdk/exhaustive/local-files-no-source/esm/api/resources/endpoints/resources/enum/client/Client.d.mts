import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.mjs";
import * as core from "../../../../../../core/index.mjs";
import type * as SeedExhaustive from "../../../../../index.mjs";
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
     * @param {SeedExhaustive.types.WeatherReport} request
     * @param {EnumClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.enum.getAndReturnEnum("SUNNY")
     */
    getAndReturnEnum(request: SeedExhaustive.types.WeatherReport, requestOptions?: EnumClient.RequestOptions): core.HttpResponsePromise<SeedExhaustive.types.WeatherReport>;
    private __getAndReturnEnum;
    protected _getAuthorizationHeader(): Promise<string | undefined>;
}
