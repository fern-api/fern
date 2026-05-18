import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.mjs";
import * as core from "../../../../../../core/index.mjs";
import type * as SeedApi from "../../../../../index.mjs";
export declare namespace PathParamClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class PathParamClient {
    protected readonly _options: NormalizedClientOptions<PathParamClient.Options>;
    constructor(options: PathParamClient.Options);
    /**
     * @param {SeedApi.enum_.SendPathParamRequest} request
     * @param {PathParamClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.enum.pathParam.send({
     *         operand: ">",
     *         operandOrColor: "red"
     *     })
     */
    send(request: SeedApi.enum_.SendPathParamRequest, requestOptions?: PathParamClient.RequestOptions): core.HttpResponsePromise<void>;
    private __send;
}
