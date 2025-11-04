import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.mjs";
import * as core from "../../../../../../core/index.mjs";
import type { Animal } from "../../../../types/resources/union/types/Animal.mjs";
export declare namespace Union {
    interface Options extends BaseClientOptions {
    }
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class Union {
    protected readonly _options: Union.Options;
    constructor(_options: Union.Options);
    /**
     * @param {Animal} request
     * @param {Union.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.union.getAndReturnUnion({
     *         animal: "dog",
     *         name: "name",
     *         likesToWoof: true
     *     })
     */
    getAndReturnUnion(request: Animal, requestOptions?: Union.RequestOptions): core.HttpResponsePromise<Animal>;
    private __getAndReturnUnion;
    protected _getAuthorizationHeader(): Promise<string | undefined>;
}
