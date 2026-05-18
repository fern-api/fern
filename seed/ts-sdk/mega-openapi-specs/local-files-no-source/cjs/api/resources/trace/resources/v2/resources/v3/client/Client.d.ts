import type { BaseClientOptions } from "../../../../../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../../../../../BaseClient.js";
import { ProblemClient } from "../resources/problem/client/Client.js";
export declare namespace V3Client {
    type Options = BaseClientOptions;
}
export declare class V3Client {
    protected readonly _options: NormalizedClientOptions<V3Client.Options>;
    protected _problem: ProblemClient | undefined;
    constructor(options: V3Client.Options);
    get problem(): ProblemClient;
}
