import type { BaseClientOptions, BaseRequestOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptionsWithAuth } from "../../../../BaseClient.js";
import * as core from "../../../../core/index.js";
import type * as SeedApi from "../../../index.js";
export declare namespace NoreqbodyClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class NoreqbodyClient {
    protected readonly _options: NormalizedClientOptionsWithAuth<NoreqbodyClient.Options>;
    constructor(options: NoreqbodyClient.Options);
    /**
     * @param {NoreqbodyClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.noreqbody.getwithnorequestbody()
     */
    getwithnorequestbody(requestOptions?: NoreqbodyClient.RequestOptions): core.HttpResponsePromise<SeedApi.TypesObjectWithOptionalField>;
    private __getwithnorequestbody;
    /**
     * @param {NoreqbodyClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.noreqbody.postwithnorequestbody()
     */
    postwithnorequestbody(requestOptions?: NoreqbodyClient.RequestOptions): core.HttpResponsePromise<string>;
    private __postwithnorequestbody;
}
