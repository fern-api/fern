import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.js";
import * as core from "../../../../../../core/index.js";
import type * as SeedApi from "../../../../../index.js";
export declare namespace EventsClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class EventsClient {
    protected readonly _options: NormalizedClientOptions<EventsClient.Options>;
    constructor(options: EventsClient.Options);
    /**
     * Subscribe to events with a oneOf-style query parameter that may be a
     * scalar enum value or a list of enum values.
     *
     * @param {SeedApi.unionQueryParameters.SubscribeEventsRequest} request
     * @param {EventsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.unionQueryParameters.events.subscribe()
     */
    subscribe(request?: SeedApi.unionQueryParameters.SubscribeEventsRequest, requestOptions?: EventsClient.RequestOptions): core.HttpResponsePromise<string>;
    private __subscribe;
}
