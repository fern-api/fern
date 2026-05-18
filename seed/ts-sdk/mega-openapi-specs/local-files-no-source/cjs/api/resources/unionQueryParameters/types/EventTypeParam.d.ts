import type * as SeedApi from "../../../index.js";
/**
 * Either a single event type or a list of event types.
 */
export type EventTypeParam = SeedApi.unionQueryParameters.EventTypeEnum | SeedApi.unionQueryParameters.EventTypeEnum[];
