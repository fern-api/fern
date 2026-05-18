import type { BaseClientOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../BaseClient.js";
import { BigunionClient } from "../resources/bigunion/client/Client.js";
import { TypesClient } from "../resources/types/client/Client.js";
import { UnionClient } from "../resources/union/client/Client.js";
export declare namespace UnionsWithLocalDateClient {
    type Options = BaseClientOptions;
}
export declare class UnionsWithLocalDateClient {
    protected readonly _options: NormalizedClientOptions<UnionsWithLocalDateClient.Options>;
    protected _bigunion: BigunionClient | undefined;
    protected _types: TypesClient | undefined;
    protected _union: UnionClient | undefined;
    constructor(options: UnionsWithLocalDateClient.Options);
    get bigunion(): BigunionClient;
    get types(): TypesClient;
    get union(): UnionClient;
}
