import type * as SeedApi from "../../../index.mjs";
export interface V2V3TestCaseTemplate {
    templateId: SeedApi.trace.V2V3TestCaseTemplateId;
    name: string;
    implementation: SeedApi.trace.V2V3TestCaseImplementation;
}
