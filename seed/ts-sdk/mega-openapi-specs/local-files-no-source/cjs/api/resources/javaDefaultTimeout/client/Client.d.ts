import type { BaseClientOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../BaseClient.js";
import { JavaDefaultTimeoutClient as JavaDefaultTimeoutClient_ } from "../resources/javaDefaultTimeout/client/Client.js";
export declare namespace JavaDefaultTimeoutClient {
    type Options = BaseClientOptions;
}
export declare class JavaDefaultTimeoutClient {
    protected readonly _options: NormalizedClientOptions<JavaDefaultTimeoutClient.Options>;
    protected _javaDefaultTimeout: JavaDefaultTimeoutClient_ | undefined;
    constructor(options: JavaDefaultTimeoutClient.Options);
    get javaDefaultTimeout(): JavaDefaultTimeoutClient_;
}
