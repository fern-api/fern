import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.mjs";
import * as core from "../../../../../../core/index.mjs";
import type * as SeedApi from "../../../../../index.mjs";
export declare namespace BigunionClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class BigunionClient {
    protected readonly _options: NormalizedClientOptions<BigunionClient.Options>;
    constructor(options: BigunionClient.Options);
    /**
     * @param {SeedApi.unionsWithLocalDate.GetBigunionRequest} request
     * @param {BigunionClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.unionsWithLocalDate.bigunion.get({
     *         id: "id"
     *     })
     */
    get(request: SeedApi.unionsWithLocalDate.GetBigunionRequest, requestOptions?: BigunionClient.RequestOptions): core.HttpResponsePromise<SeedApi.unionsWithLocalDate.BigUnion>;
    private __get;
    /**
     * @param {SeedApi.unionsWithLocalDate.BigUnion} request
     * @param {BigunionClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.unionsWithLocalDate.bigunion.update({
     *         value: "example1",
     *         type: "normalSweet"
     *     })
     */
    update(request: SeedApi.unionsWithLocalDate.BigUnion, requestOptions?: BigunionClient.RequestOptions): core.HttpResponsePromise<boolean>;
    private __update;
    /**
     * @param {SeedApi.unionsWithLocalDate.BigUnion[]} request
     * @param {BigunionClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.unionsWithLocalDate.bigunion.updateMany([{
     *             value: "example1",
     *             type: "normalSweet"
     *         }])
     */
    updateMany(request: SeedApi.unionsWithLocalDate.BigUnion[], requestOptions?: BigunionClient.RequestOptions): core.HttpResponsePromise<Record<string, boolean>>;
    private __updateMany;
}
