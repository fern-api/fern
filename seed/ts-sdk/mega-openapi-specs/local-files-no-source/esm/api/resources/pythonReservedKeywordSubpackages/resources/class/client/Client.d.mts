import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.mjs";
import * as core from "../../../../../../core/index.mjs";
export declare namespace ClassClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class ClassClient {
    protected readonly _options: NormalizedClientOptions<ClassClient.Options>;
    constructor(options: ClassClient.Options);
    /**
     * @param {ClassClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.pythonReservedKeywordSubpackages.class.create()
     */
    create(requestOptions?: ClassClient.RequestOptions): core.HttpResponsePromise<void>;
    private __create;
}
