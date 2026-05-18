import type * as SeedApi from "../../../index.js";
export interface V2TestCaseTemplate {
    templateId: SeedApi.trace.V2TestCaseTemplateId;
    name: string;
    implementation: SeedApi.trace.V2TestCaseImplementation;
}
