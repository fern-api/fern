import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../../../../../BaseClient.js";
import * as core from "../../../../../../../../core/index.js";
import type * as SeedApi from "../../../../../../../index.js";
import { MetadataClient } from "../resources/metadata/client/Client.js";
export declare namespace EventsClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class EventsClient {
    protected readonly _options: NormalizedClientOptions<EventsClient.Options>;
    protected _metadata: MetadataClient | undefined;
    constructor(options: EventsClient.Options);
    get metadata(): MetadataClient;
    /**
     * List all user events.
     *
     * @param {SeedApi.mixedFileDirectory.user.ListEventsEventsRequest} request
     * @param {EventsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.mixedFileDirectory.user.events.listEvents()
     */
    listEvents(request?: SeedApi.mixedFileDirectory.user.ListEventsEventsRequest, requestOptions?: EventsClient.RequestOptions): core.HttpResponsePromise<SeedApi.mixedFileDirectory.UserEvent[]>;
    private __listEvents;
}
