import type * as SeedApi from "../../../../../../index.mjs";
/**
 * @example
 *     {}
 */
export interface SubscribeEventsRequest {
    event_type?: SeedApi.unionQueryParameters.EventTypeParam | null;
    tags?: SeedApi.unionQueryParameters.StringOrListParam | null;
}
