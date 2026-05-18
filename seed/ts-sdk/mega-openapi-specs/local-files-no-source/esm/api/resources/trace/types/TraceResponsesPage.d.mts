import type * as SeedApi from "../../../index.mjs";
export interface TraceResponsesPage {
    /**
     * If present, use this to load subsequent pages.
     * The offset is the id of the next trace response to load.
     */
    offset?: (number | null) | undefined;
    traceResponses: SeedApi.trace.TraceResponse[];
}
