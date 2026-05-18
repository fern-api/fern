import type { BaseClientOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../BaseClient.mjs";
import { EventsClient } from "../resources/events/client/Client.mjs";
export declare namespace UnionQueryParametersClient {
    type Options = BaseClientOptions;
}
export declare class UnionQueryParametersClient {
    protected readonly _options: NormalizedClientOptions<UnionQueryParametersClient.Options>;
    protected _events: EventsClient | undefined;
    constructor(options: UnionQueryParametersClient.Options);
    get events(): EventsClient;
}
