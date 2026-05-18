import type { BaseClientOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../BaseClient.js";
import { BigunionClient } from "../resources/bigunion/client/Client.js";
import { UnionClient } from "../resources/union/client/Client.js";
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
