import type { BaseClientOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../BaseClient.mjs";
import { FolderAClient } from "../resources/folderA/client/Client.mjs";
import { FolderDClient } from "../resources/folderD/client/Client.mjs";
import { FooClient } from "../resources/foo/client/Client.mjs";
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
