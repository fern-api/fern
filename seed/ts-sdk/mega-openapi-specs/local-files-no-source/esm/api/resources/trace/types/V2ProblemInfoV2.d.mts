import type * as SeedApi from "../../../index.mjs";
export interface V2ProblemInfoV2 {
    problemId: SeedApi.trace.ProblemId;
    problemDescription: SeedApi.trace.ProblemDescription;
    problemName: string;
    problemVersion: number;
    supportedLanguages: SeedApi.trace.Language[];
    customFiles: SeedApi.trace.V2CustomFiles;
    generatedFiles: SeedApi.trace.V2GeneratedFiles;
    customTestCaseTemplates: SeedApi.trace.V2TestCaseTemplate[];
    testcases: SeedApi.trace.V2TestCaseV2[];
    isPublic: boolean;
}
