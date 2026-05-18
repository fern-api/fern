import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.js";
import { type NormalizedClientOptionsWithAuth } from "../../../../../../BaseClient.js";
import * as core from "../../../../../../core/index.js";
import type * as SeedApi from "../../../../../index.js";
export declare namespace Ec2Client {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class Ec2Client {
    protected readonly _options: NormalizedClientOptionsWithAuth<Ec2Client.Options>;
    constructor(options: Ec2Client.Options);
    /**
     * @param {SeedApi.multiUrlEnvironment.BootInstanceEc2Request} request
     * @param {Ec2Client.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.multiUrlEnvironment.ec2.bootInstance({
     *         size: "size"
     *     })
     */
    bootInstance(request: SeedApi.multiUrlEnvironment.BootInstanceEc2Request, requestOptions?: Ec2Client.RequestOptions): core.HttpResponsePromise<void>;
    private __bootInstance;
}
