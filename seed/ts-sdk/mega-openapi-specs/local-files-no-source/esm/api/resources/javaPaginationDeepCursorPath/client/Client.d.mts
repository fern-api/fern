import type { BaseClientOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../BaseClient.mjs";
import { DeepCursorPathClient } from "../resources/deepCursorPath/client/Client.mjs";
export declare namespace JavaPaginationDeepCursorPathClient {
    type Options = BaseClientOptions;
}
export declare class JavaPaginationDeepCursorPathClient {
    protected readonly _options: NormalizedClientOptions<JavaPaginationDeepCursorPathClient.Options>;
    protected _deepCursorPath: DeepCursorPathClient | undefined;
    constructor(options: JavaPaginationDeepCursorPathClient.Options);
    get deepCursorPath(): DeepCursorPathClient;
}
