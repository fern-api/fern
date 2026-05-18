import type { BaseClientOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../BaseClient.mjs";
import { TasktestClient } from "../resources/tasktest/client/Client.mjs";
export declare namespace CsharpNamespaceConflictClient {
    type Options = BaseClientOptions;
}
export declare class CsharpNamespaceConflictClient {
    protected readonly _options: NormalizedClientOptions<CsharpNamespaceConflictClient.Options>;
    protected _tasktest: TasktestClient | undefined;
    constructor(options: CsharpNamespaceConflictClient.Options);
    get tasktest(): TasktestClient;
}
