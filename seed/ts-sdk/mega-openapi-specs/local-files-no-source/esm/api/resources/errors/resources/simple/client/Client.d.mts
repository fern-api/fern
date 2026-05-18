import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.mjs";
import * as core from "../../../../../../core/index.mjs";
import * as SeedApi from "../../../../../index.mjs";
export declare namespace SimpleClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class SimpleClient {
    protected readonly _options: NormalizedClientOptions<SimpleClient.Options>;
    constructor(options: SimpleClient.Options);
    /**
     * @param {SeedApi.errors.FooRequest} request
     * @param {SimpleClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @throws {@link SeedApi.errors.BadRequestError}
     * @throws {@link SeedApi.errors.NotFoundError}
     * @throws {@link SeedApi.errors.InternalServerError}
     *
     * @example
     *     await client.errors.simple.fooWithoutEndpointError({
     *         bar: "hello"
     *     })
     */
    fooWithoutEndpointError(request: SeedApi.errors.FooRequest, requestOptions?: SimpleClient.RequestOptions): core.HttpResponsePromise<SeedApi.errors.FooResponse>;
    private __fooWithoutEndpointError;
    /**
     * @param {SeedApi.errors.FooRequest} request
     * @param {SimpleClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @throws {@link SeedApi.errors.BadRequestError}
     * @throws {@link SeedApi.errors.NotFoundError}
     * @throws {@link SeedApi.errors.TooManyRequestsError}
     * @throws {@link SeedApi.errors.InternalServerError}
     *
     * @example
     *     await client.errors.simple.foo({
     *         bar: "hello"
     *     })
     */
    foo(request: SeedApi.errors.FooRequest, requestOptions?: SimpleClient.RequestOptions): core.HttpResponsePromise<SeedApi.errors.FooResponse>;
    private __foo;
    /**
     * @param {SeedApi.errors.FooRequest} request
     * @param {SimpleClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @throws {@link SeedApi.errors.BadRequestError}
     * @throws {@link SeedApi.errors.NotFoundError}
     * @throws {@link SeedApi.errors.TooManyRequestsError}
     * @throws {@link SeedApi.errors.InternalServerError}
     *
     * @example
     *     await client.errors.simple.fooWithExamples({
     *         bar: "hello"
     *     })
     */
    fooWithExamples(request: SeedApi.errors.FooRequest, requestOptions?: SimpleClient.RequestOptions): core.HttpResponsePromise<SeedApi.errors.FooResponse>;
    private __fooWithExamples;
}
