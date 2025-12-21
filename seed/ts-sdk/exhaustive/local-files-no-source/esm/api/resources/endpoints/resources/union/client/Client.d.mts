import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.mjs";
import { type NormalizedClientOptionsWithAuth } from "../../../../../../BaseClient.mjs";
import * as core from "../../../../../../core/index.mjs";
import type * as SeedExhaustive from "../../../../../index.mjs";
export declare namespace UnionClient {
    interface Options extends BaseClientOptions {
    }
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class UnionClient {
    protected readonly _options: NormalizedClientOptionsWithAuth<UnionClient.Options>;
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
}
