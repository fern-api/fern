import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.mjs";
import * as core from "../../../../../../core/index.mjs";
import type * as SeedApi from "../../../../../index.mjs";
export declare namespace ContactsClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class ContactsClient {
    protected readonly _options: NormalizedClientOptions<ContactsClient.Options>;
    constructor(options: ContactsClient.Options);
    /**
     * Creates a new contact. Returns 200 with the contact or 204 with no content.
     *
     * @param {SeedApi.noContentResponse.CreateContactRequest} request
     * @param {ContactsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.noContentResponse.contacts.create({
     *         name: "name"
     *     })
     */
    create(request: SeedApi.noContentResponse.CreateContactRequest, requestOptions?: ContactsClient.RequestOptions): core.HttpResponsePromise<SeedApi.noContentResponse.Contact | undefined>;
    private __create;
    /**
     * Gets a contact by ID. Returns 200 with the contact.
     *
     * @param {SeedApi.noContentResponse.GetContactsRequest} request
     * @param {ContactsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.noContentResponse.contacts.get({
     *         id: "id"
     *     })
     */
    get(request: SeedApi.noContentResponse.GetContactsRequest, requestOptions?: ContactsClient.RequestOptions): core.HttpResponsePromise<SeedApi.noContentResponse.Contact>;
    private __get;
}
