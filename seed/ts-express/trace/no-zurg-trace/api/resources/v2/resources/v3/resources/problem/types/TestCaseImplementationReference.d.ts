/**
 * This file was auto-generated by Fern from our API Definition.
 */
import * as SeedTrace from "../../../../../../..";
export declare type TestCaseImplementationReference = SeedTrace.v2.v3.TestCaseImplementationReference.TemplateId | SeedTrace.v2.v3.TestCaseImplementationReference.Implementation;
export declare namespace TestCaseImplementationReference {
    interface TemplateId {
        type: "templateId";
        value: SeedTrace.v2.v3.TestCaseTemplateId;
    }
    interface Implementation extends SeedTrace.v2.v3.TestCaseImplementation {
        type: "implementation";
    }
}
