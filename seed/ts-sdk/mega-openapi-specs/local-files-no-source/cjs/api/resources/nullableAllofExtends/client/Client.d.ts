import type { BaseClientOptions, BaseRequestOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../BaseClient.js";
import * as core from "../../../../core/index.js";
import type * as SeedApi from "../../../index.js";
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
