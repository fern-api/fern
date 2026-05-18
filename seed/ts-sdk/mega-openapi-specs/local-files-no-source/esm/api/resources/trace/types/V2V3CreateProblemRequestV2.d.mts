import type * as SeedApi from "../../../index.mjs";
export interface V2V3CreateProblemRequestV2 {
    problemName: string;
    problemDescription: SeedApi.trace.ProblemDescription;
    customFiles: SeedApi.trace.V2V3CustomFiles;
    customTestCaseTemplates: SeedApi.trace.V2V3TestCaseTemplate[];
    testcases: SeedApi.trace.V2V3TestCaseV2[];
    supportedLanguages: SeedApi.trace.Language[];
    isPublic: boolean;
}
