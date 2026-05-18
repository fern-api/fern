import type * as SeedApi from "../../../index.mjs";
export type V2TestCaseImplementationReference = {
    type: "templateId";
    value?: SeedApi.trace.V2TestCaseTemplateId | undefined;
} | {
    type: "implementation";
};
