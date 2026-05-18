import type { BaseClientOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../BaseClient.js";
import { ContactsClient } from "../resources/contacts/client/Client.js";
export declare namespace NoContentResponseClient {
    type Options = BaseClientOptions;
}
export declare class NoContentResponseClient {
    protected readonly _options: NormalizedClientOptions<NoContentResponseClient.Options>;
    protected _contacts: ContactsClient | undefined;
    constructor(options: NoContentResponseClient.Options);
    get contacts(): ContactsClient;
}
