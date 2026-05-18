import type { BaseClientOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptionsWithAuth } from "../../../../BaseClient.mjs";
import { AuthClient } from "../resources/auth/client/Client.mjs";
import { FilesClient } from "../resources/files/client/Client.mjs";
import { ItemsClient } from "../resources/items/client/Client.mjs";
export declare namespace MultiUrlEnvironmentReferenceClient {
    type Options = BaseClientOptions;
}
export declare class MultiUrlEnvironmentReferenceClient {
    protected readonly _options: NormalizedClientOptionsWithAuth<MultiUrlEnvironmentReferenceClient.Options>;
    protected _items: ItemsClient | undefined;
    protected _auth: AuthClient | undefined;
    protected _files: FilesClient | undefined;
    constructor(options: MultiUrlEnvironmentReferenceClient.Options);
    get items(): ItemsClient;
    get auth(): AuthClient;
    get files(): FilesClient;
}
