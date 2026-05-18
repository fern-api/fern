import type { BaseClientOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../BaseClient.mjs";
import { UnionClient } from "../resources/union/client/Client.mjs";
export declare namespace UndiscriminatedUnionsClient {
    type Options = BaseClientOptions;
}
export declare class UndiscriminatedUnionsClient {
    protected readonly _options: NormalizedClientOptions<UndiscriminatedUnionsClient.Options>;
    protected _union: UnionClient | undefined;
    constructor(options: UndiscriminatedUnionsClient.Options);
    get union(): UnionClient;
}
