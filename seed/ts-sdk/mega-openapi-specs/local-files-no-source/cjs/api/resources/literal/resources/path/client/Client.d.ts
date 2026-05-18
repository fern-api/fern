import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.js";
import * as core from "../../../../../../core/index.js";
import type * as SeedApi from "../../../../../index.js";
export declare namespace PathClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class PathClient {
    protected readonly _options: NormalizedClientOptions<PathClient.Options>;
    constructor(options: PathClient.Options);
    /**
     * @param {SeedApi.literal.SendPathRequest} request
     * @param {PathClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.literal.path.send({
     *         id: "123"
     *     })
     */
    send(request: SeedApi.literal.SendPathRequest, requestOptions?: PathClient.RequestOptions): core.HttpResponsePromise<SeedApi.literal.SendResponse>;
    private __send;
}
