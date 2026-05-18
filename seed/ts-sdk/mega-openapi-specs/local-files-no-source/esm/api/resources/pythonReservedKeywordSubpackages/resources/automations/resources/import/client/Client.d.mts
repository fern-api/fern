import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../../../../../BaseClient.mjs";
import * as core from "../../../../../../../../core/index.mjs";
export declare namespace ImportClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class ImportClient {
    protected readonly _options: NormalizedClientOptions<ImportClient.Options>;
    constructor(options: ImportClient.Options);
    /**
     * @param {ImportClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.pythonReservedKeywordSubpackages.automations.import.create()
     */
    create(requestOptions?: ImportClient.RequestOptions): core.HttpResponsePromise<void>;
    private __create;
}
