import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.mjs";
import * as core from "../../../../../../core/index.mjs";
import type * as SeedApi from "../../../../../index.mjs";
export declare namespace PythonPositionalSinglePropertyClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class PythonPositionalSinglePropertyClient {
    protected readonly _options: NormalizedClientOptions<PythonPositionalSinglePropertyClient.Options>;
    constructor(options: PythonPositionalSinglePropertyClient.Options);
    /**
     * @param {SeedApi.pythonPositionalSingleProperty.CreateRequest} request
     * @param {PythonPositionalSinglePropertyClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.pythonPositionalSingleProperty.pythonPositionalSingleProperty.create({
     *         instrument: {
     *             identifier: {
     *                 isin: "US0378331005"
     *             },
     *             quantity: {
     *                 quantity: 10000,
     *                 type: "QUANTITY"
     *             }
     *         },
     *         taker: {
     *             trader: {
     *                 uuid_: 1234567
     *             }
     *         }
     *     })
     */
    create(request: SeedApi.pythonPositionalSingleProperty.CreateRequest, requestOptions?: PythonPositionalSinglePropertyClient.RequestOptions): core.HttpResponsePromise<string>;
    private __create;
}
