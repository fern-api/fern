import type { BaseClientOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../BaseClient.mjs";
import { BigunionClient } from "../resources/bigunion/client/Client.mjs";
import { UnionClient } from "../resources/union/client/Client.mjs";
export declare namespace UnionsClient {
    type Options = BaseClientOptions;
}
export declare class UnionsClient {
    protected readonly _options: NormalizedClientOptions<UnionsClient.Options>;
    protected _bigunion: BigunionClient | undefined;
    protected _union: UnionClient | undefined;
    constructor(options: UnionsClient.Options);
    get bigunion(): BigunionClient;
    get union(): UnionClient;
}
