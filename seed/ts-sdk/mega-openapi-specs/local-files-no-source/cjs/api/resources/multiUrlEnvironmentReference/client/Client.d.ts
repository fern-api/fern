import type { BaseClientOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptionsWithAuth } from "../../../../BaseClient.js";
import { AuthClient } from "../resources/auth/client/Client.js";
import { FilesClient } from "../resources/files/client/Client.js";
import { ItemsClient } from "../resources/items/client/Client.js";
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
