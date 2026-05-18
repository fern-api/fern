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
     * @param {SeedApi.javaStagedBuilderOrdering.SimpleStaged} request
     * @param {ServiceClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.javaStagedBuilderOrdering.service.createSimple({
     *         first: "a",
     *         second: "b",
     *         third: "c"
     *     })
     */
    createSimple(request: SeedApi.javaStagedBuilderOrdering.SimpleStaged, requestOptions?: ServiceClient.RequestOptions): core.HttpResponsePromise<string>;
    private __createSimple;
    /**
     * @param {SeedApi.javaStagedBuilderOrdering.MediumStaged} request
     * @param {ServiceClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.javaStagedBuilderOrdering.service.createMedium({
     *         alpha: "alpha",
     *         beta: 1,
     *         gamma: "gamma",
     *         delta: true,
     *         optional: "optional"
     *     })
     */
    createMedium(request: SeedApi.javaStagedBuilderOrdering.MediumStaged, requestOptions?: ServiceClient.RequestOptions): core.HttpResponsePromise<string>;
    private __createMedium;
    /**
     * @param {SeedApi.javaStagedBuilderOrdering.ComplexStaged} request
     * @param {ServiceClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.javaStagedBuilderOrdering.service.createComplex({
     *         fieldA: "a",
     *         fieldB: 1,
     *         fieldC: true,
     *         fieldD: "d",
     *         fieldE: 1.5,
     *         optionalX: "x",
     *         optionalY: 2,
     *         optionalZ: false
     *     })
     */
    createComplex(request: SeedApi.javaStagedBuilderOrdering.ComplexStaged, requestOptions?: ServiceClient.RequestOptions): core.HttpResponsePromise<string>;
    private __createComplex;
    /**
     * @param {SeedApi.javaStagedBuilderOrdering.MixedStaged} request
     * @param {ServiceClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.javaStagedBuilderOrdering.service.createMixed({
     *         id: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
     *         name: "test",
     *         timestamp: "2024-01-15T09:30:00Z",
     *         nested: {
     *             first: "a",
     *             second: "b",
     *             third: "c"
     *         },
     *         count: 42
     *     })
     */
    createMixed(request: SeedApi.javaStagedBuilderOrdering.MixedStaged, requestOptions?: ServiceClient.RequestOptions): core.HttpResponsePromise<string>;
    private __createMixed;
    /**
     * @param {SeedApi.javaStagedBuilderOrdering.Parent} request
     * @param {ServiceClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.javaStagedBuilderOrdering.service.createParent({
     *         parentId: "parent-123",
     *         child: {
     *             childId: "child-456",
     *             childValue: 789
     *         },
     *         parentName: "Parent Name"
     *     })
     */
    createParent(request: SeedApi.javaStagedBuilderOrdering.Parent, requestOptions?: ServiceClient.RequestOptions): core.HttpResponsePromise<string>;
    private __createParent;
}
