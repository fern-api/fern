import type { BaseClientOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../BaseClient.js";
import { DeepCursorPathClient } from "../resources/deepCursorPath/client/Client.js";
export declare namespace JavaPaginationDeepCursorPathClient {
    type Options = BaseClientOptions;
}
export declare class JavaPaginationDeepCursorPathClient {
    protected readonly _options: NormalizedClientOptions<JavaPaginationDeepCursorPathClient.Options>;
    protected _deepCursorPath: DeepCursorPathClient | undefined;
    constructor(options: JavaPaginationDeepCursorPathClient.Options);
    get deepCursorPath(): DeepCursorPathClient;
}
