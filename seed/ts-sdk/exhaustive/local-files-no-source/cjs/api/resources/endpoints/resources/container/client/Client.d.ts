import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.js";
import * as core from "../../../../../../core/index.js";
import type { ObjectWithRequiredField } from "../../../../types/resources/object/types/ObjectWithRequiredField.js";
export declare namespace Container {
    interface Options extends BaseClientOptions {
    }
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class Container {
    protected readonly _options: Container.Options;
    constructor(_options: Container.Options);
    /**
     * @param {string[]} request
     * @param {Container.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.container.getAndReturnListOfPrimitives(["string", "string"])
     */
    getAndReturnListOfPrimitives(request: string[], requestOptions?: Container.RequestOptions): core.HttpResponsePromise<string[]>;
    private __getAndReturnListOfPrimitives;
    /**
     * @param {ObjectWithRequiredField[]} request
     * @param {Container.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.container.getAndReturnListOfObjects([{
     *             string: "string"
     *         }, {
     *             string: "string"
     *         }])
     */
    getAndReturnListOfObjects(request: ObjectWithRequiredField[], requestOptions?: Container.RequestOptions): core.HttpResponsePromise<ObjectWithRequiredField[]>;
    private __getAndReturnListOfObjects;
    /**
     * @param {string[]} request
     * @param {Container.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.container.getAndReturnSetOfPrimitives(["string"])
     */
    getAndReturnSetOfPrimitives(request: string[], requestOptions?: Container.RequestOptions): core.HttpResponsePromise<string[]>;
    private __getAndReturnSetOfPrimitives;
    /**
     * @param {ObjectWithRequiredField[]} request
     * @param {Container.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.container.getAndReturnSetOfObjects([{
     *             string: "string"
     *         }])
     */
    getAndReturnSetOfObjects(request: ObjectWithRequiredField[], requestOptions?: Container.RequestOptions): core.HttpResponsePromise<ObjectWithRequiredField[]>;
    private __getAndReturnSetOfObjects;
    /**
     * @param {Record<string, string>} request
     * @param {Container.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.container.getAndReturnMapPrimToPrim({
     *         "string": "string"
     *     })
     */
    getAndReturnMapPrimToPrim(request: Record<string, string>, requestOptions?: Container.RequestOptions): core.HttpResponsePromise<Record<string, string>>;
    private __getAndReturnMapPrimToPrim;
    /**
     * @param {Record<string, ObjectWithRequiredField>} request
     * @param {Container.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.container.getAndReturnMapOfPrimToObject({
     *         "string": {
     *             string: "string"
     *         }
     *     })
     */
    getAndReturnMapOfPrimToObject(request: Record<string, ObjectWithRequiredField>, requestOptions?: Container.RequestOptions): core.HttpResponsePromise<Record<string, ObjectWithRequiredField>>;
    private __getAndReturnMapOfPrimToObject;
    /**
     * @param {ObjectWithRequiredField} request
     * @param {Container.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.container.getAndReturnOptional({
     *         string: "string"
     *     })
     */
    getAndReturnOptional(request?: ObjectWithRequiredField, requestOptions?: Container.RequestOptions): core.HttpResponsePromise<ObjectWithRequiredField | undefined>;
    private __getAndReturnOptional;
    protected _getAuthorizationHeader(): Promise<string | undefined>;
}
