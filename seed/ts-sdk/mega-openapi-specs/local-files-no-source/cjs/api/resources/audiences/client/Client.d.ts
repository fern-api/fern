import type { BaseClientOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../BaseClient.js";
import { FolderAClient } from "../resources/folderA/client/Client.js";
import { FolderDClient } from "../resources/folderD/client/Client.js";
import { FooClient } from "../resources/foo/client/Client.js";
export declare namespace AudiencesClient {
    type Options = BaseClientOptions;
}
export declare class AudiencesClient {
    protected readonly _options: NormalizedClientOptions<AudiencesClient.Options>;
    protected _foo: FooClient | undefined;
    protected _folderA: FolderAClient | undefined;
    protected _folderD: FolderDClient | undefined;
    constructor(options: AudiencesClient.Options);
    get foo(): FooClient;
    get folderA(): FolderAClient;
    get folderD(): FolderDClient;
}
