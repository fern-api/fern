import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.mjs";
import * as core from "../../../../../../core/index.mjs";
import { ProblemClient } from "../resources/problem/client/Client.mjs";
import { V3Client } from "../resources/v3/client/Client.mjs";
export declare namespace V2Client {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class V2Client {
    protected readonly _options: NormalizedClientOptions<V2Client.Options>;
    protected _problem: ProblemClient | undefined;
    protected _v3: V3Client | undefined;
    constructor(options: V2Client.Options);
    get problem(): ProblemClient;
    get v3(): V3Client;
    /**
     * @param {V2Client.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.trace.v2.test()
     */
    test(requestOptions?: V2Client.RequestOptions): core.HttpResponsePromise<void>;
    private __test;
}
