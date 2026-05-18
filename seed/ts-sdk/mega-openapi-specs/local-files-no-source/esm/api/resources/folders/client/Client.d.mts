import type { BaseClientOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../BaseClient.mjs";
import { ABClient } from "../resources/aB/client/Client.mjs";
import { ACClient } from "../resources/aC/client/Client.mjs";
import { FolderClient } from "../resources/folder/client/Client.mjs";
import { FoldersClient as FoldersClient_ } from "../resources/folders/client/Client.mjs";
export declare namespace FoldersClient {
    type Options = BaseClientOptions;
}
export declare class FoldersClient {
    protected readonly _options: NormalizedClientOptions<FoldersClient.Options>;
    protected _folders: FoldersClient_ | undefined;
    protected _aB: ABClient | undefined;
    protected _aC: ACClient | undefined;
    protected _folder: FolderClient | undefined;
    constructor(options: FoldersClient.Options);
    get folders(): FoldersClient_;
    get aB(): ABClient;
    get aC(): ACClient;
    get folder(): FolderClient;
}
