import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.js";
import * as core from "../../../../../../core/index.js";
import type * as SeedExhaustive from "../../../../../index.js";
export declare namespace UnionClient {
    interface Options extends BaseClientOptions {
    }
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class UnionClient {
    protected readonly _options: UnionClient.Options;
    constructor(options: UnionClient.Options);
    /**
     * @param {SeedExhaustive.types.Animal} request
     * @param {UnionClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.union.getAndReturnUnion({
     *         animal: "dog",
     *         name: "name",
     *         likesToWoof: true
     *     })
     */
    getAndReturnUnion(request: SeedExhaustive.types.Animal, requestOptions?: UnionClient.RequestOptions): core.HttpResponsePromise<SeedExhaustive.types.Animal>;
    private __getAndReturnUnion;
    protected _getAuthorizationHeader(): Promise<string | undefined>;
}
