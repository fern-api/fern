/**
 * This file was auto-generated by Fern from our API Definition.
 */
import * as serializers from "../../..";
import * as SeedTrace from "../../../../api";
import * as core from "../../../../core";
export declare const TraceResponsesPage: core.serialization.ObjectSchema<serializers.TraceResponsesPage.Raw, SeedTrace.TraceResponsesPage>;
export declare namespace TraceResponsesPage {
    interface Raw {
        offset?: number | null;
        traceResponses: serializers.TraceResponse.Raw[];
    }
}
