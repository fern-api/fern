import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.mjs";
import * as core from "../../../../../../core/index.mjs";
import * as SeedApi from "../../../../../index.mjs";
export declare namespace TestGroupClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class TestGroupClient {
    protected readonly _options: NormalizedClientOptions<TestGroupClient.Options>;
    constructor(options: TestGroupClient.Options);
    /**
     * Post a nullable request body
     *
     * @param {SeedApi.nullableRequestBody.TestMethodNameTestGroupRequest} request
     * @param {TestGroupClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @throws {@link SeedApi.nullableRequestBody.UnprocessableEntityError}
     *
     * @example
     *     await client.nullableRequestBody.testGroup.testMethodName({
     *         path_param: "path_param",
     *         body: {}
     *     })
     */
    testMethodName(request: SeedApi.nullableRequestBody.TestMethodNameTestGroupRequest, requestOptions?: TestGroupClient.RequestOptions): core.HttpResponsePromise<unknown>;
    private __testMethodName;
}
