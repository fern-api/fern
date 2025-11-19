import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.mjs";
import * as core from "../../../../../../core/index.mjs";
import type { Animal } from "../../../../types/resources/union/types/Animal.mjs";
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
     * @param {Animal} request
     * @param {UnionClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.union.getAndReturnUnion({
     *         animal: "dog",
     *         name: "name",
     *         likesToWoof: true
     *     })
     */
    getAndReturnUnion(request: Animal, requestOptions?: UnionClient.RequestOptions): core.HttpResponsePromise<Animal>;
    private __getAndReturnUnion;
    protected _getAuthorizationHeader(): Promise<string | undefined>;
}
