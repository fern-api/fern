import type { BaseClientOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../BaseClient.mjs";
import { BigunionClient } from "../resources/bigunion/client/Client.mjs";
import { TypesClient } from "../resources/types/client/Client.mjs";
import { UnionClient } from "../resources/union/client/Client.mjs";
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
