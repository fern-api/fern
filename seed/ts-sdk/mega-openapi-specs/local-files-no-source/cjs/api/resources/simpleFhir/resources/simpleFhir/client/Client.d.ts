import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.js";
import * as core from "../../../../../../core/index.js";
import type * as SeedApi from "../../../../../index.js";
export declare namespace SimpleFhirClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class SimpleFhirClient {
    protected readonly _options: NormalizedClientOptions<SimpleFhirClient.Options>;
    constructor(options: SimpleFhirClient.Options);
    /**
     * @param {SeedApi.simpleFhir.GetAccountRequest} request
     * @param {SimpleFhirClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.simpleFhir.simpleFhir.getAccount({
     *         account_id: "account_id"
     *     })
     */
    getAccount(request: SeedApi.simpleFhir.GetAccountRequest, requestOptions?: SimpleFhirClient.RequestOptions): core.HttpResponsePromise<SeedApi.simpleFhir.Account>;
    private __getAccount;
}
