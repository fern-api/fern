import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.js";
import * as core from "../../../../../../core/index.js";
import type { ObjectWithOptionalField } from "../../../../types/resources/object/types/ObjectWithOptionalField.js";
export declare namespace ContentTypeClient {
    interface Options extends BaseClientOptions {
    }
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class ContentTypeClient {
    protected readonly _options: ContentTypeClient.Options;
    constructor(options: ContentTypeClient.Options);
    /**
     * @param {ObjectWithOptionalField} request
     * @param {ContentTypeClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.contentType.postJsonPatchContentType({
     *         string: "string",
     *         integer: 1,
     *         long: 1000000,
     *         double: 1.1,
     *         bool: true,
     *         datetime: "2024-01-15T09:30:00Z",
     *         date: "2023-01-15",
     *         uuid: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
     *         base64: "SGVsbG8gd29ybGQh",
     *         list: ["list", "list"],
     *         set: ["set"],
     *         map: {
     *             1: "map"
     *         },
     *         bigint: "1000000"
     *     })
     */
    postJsonPatchContentType(request: ObjectWithOptionalField, requestOptions?: ContentTypeClient.RequestOptions): core.HttpResponsePromise<void>;
    private __postJsonPatchContentType;
    /**
     * @param {ObjectWithOptionalField} request
     * @param {ContentTypeClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.contentType.postJsonPatchContentWithCharsetType({
     *         string: "string",
     *         integer: 1,
     *         long: 1000000,
     *         double: 1.1,
     *         bool: true,
     *         datetime: "2024-01-15T09:30:00Z",
     *         date: "2023-01-15",
     *         uuid: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
     *         base64: "SGVsbG8gd29ybGQh",
     *         list: ["list", "list"],
     *         set: ["set"],
     *         map: {
     *             1: "map"
     *         },
     *         bigint: "1000000"
     *     })
     */
    postJsonPatchContentWithCharsetType(request: ObjectWithOptionalField, requestOptions?: ContentTypeClient.RequestOptions): core.HttpResponsePromise<void>;
    private __postJsonPatchContentWithCharsetType;
    protected _getAuthorizationHeader(): Promise<string | undefined>;
}
