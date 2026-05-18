import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.mjs";
import * as core from "../../../../../../core/index.mjs";
import type * as SeedApi from "../../../../../index.mjs";
export declare namespace ServiceClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class ServiceClient {
    protected readonly _options: NormalizedClientOptions<ServiceClient.Options>;
    constructor(options: ServiceClient.Options);
    /**
     * @param {SeedApi.contentType.PatchServiceRequest} request
     * @param {ServiceClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.contentType.service.patch({})
     */
    patch(request: SeedApi.contentType.PatchServiceRequest, requestOptions?: ServiceClient.RequestOptions): core.HttpResponsePromise<void>;
    private __patch;
    /**
     * Update with JSON merge patch - complex types.
     * This endpoint demonstrates the distinction between:
     * - optional<T> fields (can be present or absent, but not null)
     * - optional<nullable<T>> fields (can be present, absent, or null)
     *
     * @param {SeedApi.contentType.PatchComplexServiceRequest} request
     * @param {ServiceClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.contentType.service.patchComplex({
     *         id: "id"
     *     })
     */
    patchComplex(request: SeedApi.contentType.PatchComplexServiceRequest, requestOptions?: ServiceClient.RequestOptions): core.HttpResponsePromise<void>;
    private __patchComplex;
    /**
     * Named request with mixed optional/nullable fields and merge-patch content type.
     * This should trigger the NPE issue when optional fields aren't initialized.
     *
     * @param {SeedApi.contentType.NamedPatchWithMixedServiceRequest} request
     * @param {ServiceClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.contentType.service.namedPatchWithMixed({
     *         id: "id"
     *     })
     */
    namedPatchWithMixed(request: SeedApi.contentType.NamedPatchWithMixedServiceRequest, requestOptions?: ServiceClient.RequestOptions): core.HttpResponsePromise<void>;
    private __namedPatchWithMixed;
    /**
     * Test endpoint to verify Optional field initialization and JsonSetter with Nulls.SKIP.
     * This endpoint should:
     * 1. Not NPE when fields are not provided (tests initialization)
     * 2. Not NPE when fields are explicitly null in JSON (tests Nulls.SKIP)
     *
     * @param {SeedApi.contentType.OptionalMergePatchTestServiceRequest} request
     * @param {ServiceClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.contentType.service.optionalMergePatchTest({
     *         requiredField: "requiredField"
     *     })
     */
    optionalMergePatchTest(request: SeedApi.contentType.OptionalMergePatchTestServiceRequest, requestOptions?: ServiceClient.RequestOptions): core.HttpResponsePromise<void>;
    private __optionalMergePatchTest;
    /**
     * Regular PATCH endpoint without merge-patch semantics
     *
     * @param {SeedApi.contentType.RegularPatchServiceRequest} request
     * @param {ServiceClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.contentType.service.regularPatch({
     *         id: "id"
     *     })
     */
    regularPatch(request: SeedApi.contentType.RegularPatchServiceRequest, requestOptions?: ServiceClient.RequestOptions): core.HttpResponsePromise<void>;
    private __regularPatch;
}
