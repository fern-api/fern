import type { BaseClientOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../BaseClient.js";
import { TasktestClient } from "../resources/tasktest/client/Client.js";
export declare namespace CsharpNamespaceConflictClient {
    type Options = BaseClientOptions;
}
export declare class CsharpNamespaceConflictClient {
    protected readonly _options: NormalizedClientOptions<CsharpNamespaceConflictClient.Options>;
    protected _tasktest: TasktestClient | undefined;
    constructor(options: CsharpNamespaceConflictClient.Options);
    get tasktest(): TasktestClient;
}
