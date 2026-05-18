import type { BaseClientOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../BaseClient.mjs";
import { JavaRequiredBodyOptionalHeadersClient as JavaRequiredBodyOptionalHeadersClient_ } from "../resources/javaRequiredBodyOptionalHeaders/client/Client.mjs";
export declare namespace JavaRequiredBodyOptionalHeadersClient {
    type Options = BaseClientOptions;
}
export declare class JavaRequiredBodyOptionalHeadersClient {
    protected readonly _options: NormalizedClientOptions<JavaRequiredBodyOptionalHeadersClient.Options>;
    protected _javaRequiredBodyOptionalHeaders: JavaRequiredBodyOptionalHeadersClient_ | undefined;
    constructor(options: JavaRequiredBodyOptionalHeadersClient.Options);
    get javaRequiredBodyOptionalHeaders(): JavaRequiredBodyOptionalHeadersClient_;
}
