import type * as SeedApi from "../../../index.mjs";
/**
 * Either a single event type or a list of event types.
 */
export type EventTypeParam = SeedApi.unionQueryParameters.EventTypeEnum | SeedApi.unionQueryParameters.EventTypeEnum[];
