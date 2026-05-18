import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.mjs";
import * as core from "../../../../../../core/index.mjs";
import type * as SeedApi from "../../../../../index.mjs";
export declare namespace UndiscriminatedUnionWithResponsePropertyClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class UndiscriminatedUnionWithResponsePropertyClient {
    protected readonly _options: NormalizedClientOptions<UndiscriminatedUnionWithResponsePropertyClient.Options>;
    constructor(options: UndiscriminatedUnionWithResponsePropertyClient.Options);
    /**
     * @param {UndiscriminatedUnionWithResponsePropertyClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.undiscriminatedUnionWithResponseProperty.undiscriminatedUnionWithResponseProperty.getUnion()
     */
    getUnion(requestOptions?: UndiscriminatedUnionWithResponsePropertyClient.RequestOptions): core.HttpResponsePromise<SeedApi.undiscriminatedUnionWithResponseProperty.UnionResponse>;
    private __getUnion;
    /**
     * @param {UndiscriminatedUnionWithResponsePropertyClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.undiscriminatedUnionWithResponseProperty.undiscriminatedUnionWithResponseProperty.listUnions()
     */
    listUnions(requestOptions?: UndiscriminatedUnionWithResponsePropertyClient.RequestOptions): core.HttpResponsePromise<SeedApi.undiscriminatedUnionWithResponseProperty.UnionListResponse>;
    private __listUnions;
}
