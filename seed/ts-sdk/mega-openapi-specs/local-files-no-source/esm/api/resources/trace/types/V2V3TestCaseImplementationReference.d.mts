import type * as SeedApi from "../../../index.mjs";
export type V2V3TestCaseImplementationReference = {
    type: "templateId";
    value?: SeedApi.trace.V2V3TestCaseTemplateId | undefined;
} | {
    type: "implementation";
};
