import type { BaseClientOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../BaseClient.mjs";
import { ContactsClient } from "../resources/contacts/client/Client.mjs";
export declare namespace NoContentResponseClient {
    type Options = BaseClientOptions;
}
export declare class NoContentResponseClient {
    protected readonly _options: NormalizedClientOptions<NoContentResponseClient.Options>;
    protected _contacts: ContactsClient | undefined;
    constructor(options: NoContentResponseClient.Options);
    get contacts(): ContactsClient;
}
