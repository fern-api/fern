import type { BaseClientOptions, BaseRequestOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../BaseClient.mjs";
import * as core from "../../../../core/index.mjs";
import type * as SeedApi from "../../../index.mjs";
export declare namespace NullableAllofExtendsClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class NullableAllofExtendsClient {
    protected readonly _options: NormalizedClientOptions<NullableAllofExtendsClient.Options>;
    constructor(options: NullableAllofExtendsClient.Options);
    /**
     * Returns a RootObject which inherits from a nullable schema.
     *
     * @param {NullableAllofExtendsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.nullableAllofExtends.getTest()
     */
    getTest(requestOptions?: NullableAllofExtendsClient.RequestOptions): core.HttpResponsePromise<SeedApi.nullableAllofExtends.RootObject>;
    private __getTest;
    /**
     * Creates a test object with nullable allOf in request body.
     *
     * @param {SeedApi.nullableAllofExtends.RootObject} request
     * @param {NullableAllofExtendsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.nullableAllofExtends.createTest({})
     */
    createTest(request: SeedApi.nullableAllofExtends.RootObject, requestOptions?: NullableAllofExtendsClient.RequestOptions): core.HttpResponsePromise<SeedApi.nullableAllofExtends.RootObject>;
    private __createTest;
}
