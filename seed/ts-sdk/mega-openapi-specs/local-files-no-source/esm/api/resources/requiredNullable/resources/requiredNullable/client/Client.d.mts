import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.mjs";
import * as core from "../../../../../../core/index.mjs";
import type * as SeedApi from "../../../../../index.mjs";
export declare namespace RequiredNullableClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class RequiredNullableClient {
    protected readonly _options: NormalizedClientOptions<RequiredNullableClient.Options>;
    constructor(options: RequiredNullableClient.Options);
    /**
     * @param {SeedApi.requiredNullable.GetFooRequest} request
     * @param {RequiredNullableClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.requiredNullable.requiredNullable.getFoo({
     *         required_baz: "required_baz",
     *         required_nullable_baz: "required_nullable_baz"
     *     })
     */
    getFoo(request: SeedApi.requiredNullable.GetFooRequest, requestOptions?: RequiredNullableClient.RequestOptions): core.HttpResponsePromise<SeedApi.requiredNullable.Foo>;
    private __getFoo;
    /**
     * @param {SeedApi.requiredNullable.UpdateFooRequest} request
     * @param {RequiredNullableClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.requiredNullable.requiredNullable.updateFoo({
     *         "X-Idempotency-Key": "X-Idempotency-Key",
     *         id: "id"
     *     })
     */
    updateFoo(request: SeedApi.requiredNullable.UpdateFooRequest, requestOptions?: RequiredNullableClient.RequestOptions): core.HttpResponsePromise<SeedApi.requiredNullable.Foo>;
    private __updateFoo;
}
