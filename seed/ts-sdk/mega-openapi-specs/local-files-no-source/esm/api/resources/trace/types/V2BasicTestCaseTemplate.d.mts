import type * as SeedApi from "../../../index.mjs";
export interface V2BasicTestCaseTemplate {
    templateId: SeedApi.trace.V2TestCaseTemplateId;
    name: string;
    description: SeedApi.trace.V2TestCaseImplementationDescription;
    expectedValueParameterId: SeedApi.trace.V2ParameterId;
}
