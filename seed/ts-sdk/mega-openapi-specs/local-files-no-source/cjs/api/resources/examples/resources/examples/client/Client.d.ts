import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.js";
import * as core from "../../../../../../core/index.js";
import type * as SeedApi from "../../../../../index.js";
export declare namespace ExamplesClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class ExamplesClient {
    protected readonly _options: NormalizedClientOptions<ExamplesClient.Options>;
    constructor(options: ExamplesClient.Options);
    /**
     * @param {string} request
     * @param {ExamplesClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.examples.examples.echo("Hello world!\\n\\nwith\\n\\tnewlines")
     */
    echo(request: string, requestOptions?: ExamplesClient.RequestOptions): core.HttpResponsePromise<string>;
    private __echo;
    /**
     * @param {SeedApi.examples.Type} request
     * @param {ExamplesClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.examples.examples.createType("primitive")
     */
    createType(request: SeedApi.examples.Type, requestOptions?: ExamplesClient.RequestOptions): core.HttpResponsePromise<SeedApi.examples.Identifier>;
    private __createType;
}
