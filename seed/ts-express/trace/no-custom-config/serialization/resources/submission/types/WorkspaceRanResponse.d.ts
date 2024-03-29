/**
 * This file was auto-generated by Fern from our API Definition.
 */
import * as serializers from "../../..";
import * as SeedTrace from "../../../../api";
import * as core from "../../../../core";
export declare const WorkspaceRanResponse: core.serialization.ObjectSchema<serializers.WorkspaceRanResponse.Raw, SeedTrace.WorkspaceRanResponse>;
export declare namespace WorkspaceRanResponse {
    interface Raw {
        submissionId: serializers.SubmissionId.Raw;
        runDetails: serializers.WorkspaceRunDetails.Raw;
    }
}
