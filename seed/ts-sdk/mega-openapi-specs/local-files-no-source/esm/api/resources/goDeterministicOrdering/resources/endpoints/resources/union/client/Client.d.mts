import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../../../BaseClient.mjs";
import { type NormalizedClientOptionsWithAuth } from "../../../../../../../../BaseClient.mjs";
import * as core from "../../../../../../../../core/index.mjs";
import type * as SeedApi from "../../../../../../../index.mjs";
export declare namespace UnionClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class UnionClient {
    protected readonly _options: NormalizedClientOptionsWithAuth<UnionClient.Options>;
    constructor(options: UnionClient.Options);
    /**
     * @param {SeedApi.goDeterministicOrdering.TypesAnimal} request
     * @param {UnionClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.goDeterministicOrdering.endpoints.union.getAndReturnUnion({
     *         name: "name",
     *         likesToWoof: true,
     *         animal: "dog"
     *     })
     */
    getAndReturnUnion(request: SeedApi.goDeterministicOrdering.TypesAnimal, requestOptions?: UnionClient.RequestOptions): core.HttpResponsePromise<SeedApi.goDeterministicOrdering.TypesAnimal>;
    private __getAndReturnUnion;
}
