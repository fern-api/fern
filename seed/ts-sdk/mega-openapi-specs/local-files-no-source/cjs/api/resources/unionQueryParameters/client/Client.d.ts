import type { BaseClientOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../BaseClient.js";
import { EventsClient } from "../resources/events/client/Client.js";
export declare namespace UnionQueryParametersClient {
    type Options = BaseClientOptions;
}
export declare class UnionQueryParametersClient {
    protected readonly _options: NormalizedClientOptions<UnionQueryParametersClient.Options>;
    protected _events: EventsClient | undefined;
    constructor(options: UnionQueryParametersClient.Options);
    get events(): EventsClient;
}
