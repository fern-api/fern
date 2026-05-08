import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.js";
import { type NormalizedClientOptionsWithAuth } from "../../../../../../BaseClient.js";
import * as core from "../../../../../../core/index.js";
import type * as SeedApi from "../../../../../index.js";
export declare namespace UnionClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class UnionClient {
    protected readonly _options: NormalizedClientOptionsWithAuth<UnionClient.Options>;
    constructor(options: UnionClient.Options);
    /**
     * @param {SeedApi.TypesAnimal} request
     * @param {UnionClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.union.getAndReturnUnion({
     *         name: "name",
     *         likesToWoof: true,
     *         animal: "dog"
     *     })
     */
    getAndReturnUnion(request: SeedApi.TypesAnimal, requestOptions?: UnionClient.RequestOptions): core.HttpResponsePromise<SeedApi.TypesAnimal>;
    private __getAndReturnUnion;
}
