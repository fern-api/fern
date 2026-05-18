import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.mjs";
import * as core from "../../../../../../core/index.mjs";
import type * as SeedApi from "../../../../../index.mjs";
export declare namespace ValidationClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class ValidationClient {
    protected readonly _options: NormalizedClientOptions<ValidationClient.Options>;
    constructor(options: ValidationClient.Options);
    /**
     * @param {SeedApi.validation.CreateRequest} request
     * @param {ValidationClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.validation.validation.create({
     *         decimal: 1.1,
     *         even: 1,
     *         name: "name",
     *         shape: "SQUARE"
     *     })
     */
    create(request: SeedApi.validation.CreateRequest, requestOptions?: ValidationClient.RequestOptions): core.HttpResponsePromise<SeedApi.validation.Type>;
    private __create;
    /**
     * @param {SeedApi.validation.GetRequest} request
     * @param {ValidationClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.validation.validation.get({
     *         decimal: 1.1,
     *         even: 1,
     *         name: "name"
     *     })
     */
    get(request: SeedApi.validation.GetRequest, requestOptions?: ValidationClient.RequestOptions): core.HttpResponsePromise<SeedApi.validation.Type>;
    private __get;
}
