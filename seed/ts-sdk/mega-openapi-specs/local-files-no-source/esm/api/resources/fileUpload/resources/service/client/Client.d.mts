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
     * @param {SeedApi.fileUpload.PostServiceRequest} request
     * @param {ServiceClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     import { createReadStream } from "fs";
     *     await client.fileUpload.service.post({})
     */
    post(request: SeedApi.fileUpload.PostServiceRequest, requestOptions?: ServiceClient.RequestOptions): core.HttpResponsePromise<void>;
    private __post;
    /**
     * @param {SeedApi.fileUpload.JustFileServiceRequest} request
     * @param {ServiceClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     import { createReadStream } from "fs";
     *     await client.fileUpload.service.justFile({})
     */
    justFile(request: SeedApi.fileUpload.JustFileServiceRequest, requestOptions?: ServiceClient.RequestOptions): core.HttpResponsePromise<void>;
    private __justFile;
    /**
     * @param {SeedApi.fileUpload.JustFileWithQueryParamsServiceRequest} request
     * @param {ServiceClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     import { createReadStream } from "fs";
     *     await client.fileUpload.service.justFileWithQueryParams({
     *         integer: 1,
     *         listOfStrings: ["listOfStrings"]
     *     })
     */
    justFileWithQueryParams(request: SeedApi.fileUpload.JustFileWithQueryParamsServiceRequest, requestOptions?: ServiceClient.RequestOptions): core.HttpResponsePromise<void>;
    private __justFileWithQueryParams;
    /**
     * @param {SeedApi.fileUpload.JustFileWithOptionalQueryParamsServiceRequest} request
     * @param {ServiceClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     import { createReadStream } from "fs";
     *     await client.fileUpload.service.justFileWithOptionalQueryParams({})
     */
    justFileWithOptionalQueryParams(request: SeedApi.fileUpload.JustFileWithOptionalQueryParamsServiceRequest, requestOptions?: ServiceClient.RequestOptions): core.HttpResponsePromise<void>;
    private __justFileWithOptionalQueryParams;
    /**
     * @param {SeedApi.fileUpload.WithContentTypeServiceRequest} request
     * @param {ServiceClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     import { createReadStream } from "fs";
     *     await client.fileUpload.service.withContentType({})
     */
    withContentType(request: SeedApi.fileUpload.WithContentTypeServiceRequest, requestOptions?: ServiceClient.RequestOptions): core.HttpResponsePromise<void>;
    private __withContentType;
    /**
     * @param {SeedApi.fileUpload.WithFormEncodingServiceRequest} request
     * @param {ServiceClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     import { createReadStream } from "fs";
     *     await client.fileUpload.service.withFormEncoding({})
     */
    withFormEncoding(request: SeedApi.fileUpload.WithFormEncodingServiceRequest, requestOptions?: ServiceClient.RequestOptions): core.HttpResponsePromise<void>;
    private __withFormEncoding;
    /**
     * @param {SeedApi.fileUpload.WithFormEncodedContainersServiceRequest} request
     * @param {ServiceClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     import { createReadStream } from "fs";
     *     await client.fileUpload.service.withFormEncodedContainers({})
     */
    withFormEncodedContainers(request: SeedApi.fileUpload.WithFormEncodedContainersServiceRequest, requestOptions?: ServiceClient.RequestOptions): core.HttpResponsePromise<void>;
    private __withFormEncodedContainers;
    /**
     * @param {SeedApi.fileUpload.OptionalArgsServiceRequest} request
     * @param {ServiceClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     import { createReadStream } from "fs";
     *     await client.fileUpload.service.optionalArgs({})
     */
    optionalArgs(request: SeedApi.fileUpload.OptionalArgsServiceRequest, requestOptions?: ServiceClient.RequestOptions): core.HttpResponsePromise<string>;
    private __optionalArgs;
    /**
     * @param {SeedApi.fileUpload.WithInlineTypeServiceRequest} request
     * @param {ServiceClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     import { createReadStream } from "fs";
     *     await client.fileUpload.service.withInlineType({})
     */
    withInlineType(request: SeedApi.fileUpload.WithInlineTypeServiceRequest, requestOptions?: ServiceClient.RequestOptions): core.HttpResponsePromise<string>;
    private __withInlineType;
    /**
     * @param {SeedApi.fileUpload.WithJsonPropertyServiceRequest} request
     * @param {ServiceClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     import { createReadStream } from "fs";
     *     await client.fileUpload.service.withJsonProperty({})
     */
    withJsonProperty(request: SeedApi.fileUpload.WithJsonPropertyServiceRequest, requestOptions?: ServiceClient.RequestOptions): core.HttpResponsePromise<string>;
    private __withJsonProperty;
    /**
     * @param {SeedApi.fileUpload.WithRefBodyServiceRequest} request
     * @param {ServiceClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     import { createReadStream } from "fs";
     *     await client.fileUpload.service.withRefBody({})
     */
    withRefBody(request: SeedApi.fileUpload.WithRefBodyServiceRequest, requestOptions?: ServiceClient.RequestOptions): core.HttpResponsePromise<string>;
    private __withRefBody;
    /**
     * @param {ServiceClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.fileUpload.service.simple()
     */
    simple(requestOptions?: ServiceClient.RequestOptions): core.HttpResponsePromise<void>;
    private __simple;
    /**
     * @param {SeedApi.fileUpload.WithLiteralAndEnumTypesServiceRequest} request
     * @param {ServiceClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     import { createReadStream } from "fs";
     *     await client.fileUpload.service.withLiteralAndEnumTypes({})
     */
    withLiteralAndEnumTypes(request: SeedApi.fileUpload.WithLiteralAndEnumTypesServiceRequest, requestOptions?: ServiceClient.RequestOptions): core.HttpResponsePromise<string>;
    private __withLiteralAndEnumTypes;
}
