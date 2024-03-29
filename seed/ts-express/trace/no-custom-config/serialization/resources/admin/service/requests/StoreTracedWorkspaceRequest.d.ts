/**
 * This file was auto-generated by Fern from our API Definition.
 */
import * as serializers from "../../../..";
import * as SeedTrace from "../../../../../api";
import * as core from "../../../../../core";
export declare const StoreTracedWorkspaceRequest: core.serialization.Schema<serializers.StoreTracedWorkspaceRequest.Raw, SeedTrace.StoreTracedWorkspaceRequest>;
export declare namespace StoreTracedWorkspaceRequest {
    interface Raw {
        workspaceRunDetails: serializers.WorkspaceRunDetails.Raw;
        traceResponses: serializers.TraceResponse.Raw[];
    }
}
