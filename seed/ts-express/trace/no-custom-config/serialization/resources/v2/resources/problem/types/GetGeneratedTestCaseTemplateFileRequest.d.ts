/**
 * This file was auto-generated by Fern from our API Definition.
 */
import * as serializers from "../../../../..";
import * as SeedTrace from "../../../../../../api";
import * as core from "../../../../../../core";
export declare const GetGeneratedTestCaseTemplateFileRequest: core.serialization.ObjectSchema<serializers.v2.GetGeneratedTestCaseTemplateFileRequest.Raw, SeedTrace.v2.GetGeneratedTestCaseTemplateFileRequest>;
export declare namespace GetGeneratedTestCaseTemplateFileRequest {
    interface Raw {
        template: serializers.v2.TestCaseTemplate.Raw;
    }
}
