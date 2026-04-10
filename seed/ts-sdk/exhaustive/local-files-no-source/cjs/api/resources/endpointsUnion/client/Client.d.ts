import type { BaseClientOptions, BaseRequestOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptionsWithAuth } from "../../../../BaseClient.js";
import * as core from "../../../../core/index.js";
import type * as SeedApi from "../../../index.js";
export declare namespace EndpointsUnionClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class EndpointsUnionClient {
    protected readonly _options: NormalizedClientOptionsWithAuth<EndpointsUnionClient.Options>;
    constructor(options: EndpointsUnionClient.Options);
    /**
     * @param {SeedApi.TypesAnimal} request
     * @param {EndpointsUnionClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpointsUnion.endpointsUnionGetAndReturnUnion({
     *         name: "name",
     *         likesToWoof: true,
     *         animal: "dog"
     *     })
     */
    endpointsUnionGetAndReturnUnion(request: SeedApi.TypesAnimal, requestOptions?: EndpointsUnionClient.RequestOptions): core.HttpResponsePromise<SeedApi.TypesAnimal>;
    private __endpointsUnionGetAndReturnUnion;
}
