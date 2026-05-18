import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../../../../../BaseClient.js";
import * as core from "../../../../../../../../core/index.js";
export declare namespace ExportClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class ExportClient {
    protected readonly _options: NormalizedClientOptions<ExportClient.Options>;
    constructor(options: ExportClient.Options);
    /**
     * @param {ExportClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.pythonReservedKeywordSubpackages.automations.export.create()
     */
    create(requestOptions?: ExportClient.RequestOptions): core.HttpResponsePromise<void>;
    private __create;
}
