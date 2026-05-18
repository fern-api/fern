import type * as SeedApi from "../../../index.js";
export interface V2V3ProblemInfoV2 {
    problemId: SeedApi.trace.ProblemId;
    problemDescription: SeedApi.trace.ProblemDescription;
    problemName: string;
    problemVersion: number;
    supportedLanguages: SeedApi.trace.Language[];
    customFiles: SeedApi.trace.V2V3CustomFiles;
    generatedFiles: SeedApi.trace.V2V3GeneratedFiles;
    customTestCaseTemplates: SeedApi.trace.V2V3TestCaseTemplate[];
    testcases: SeedApi.trace.V2V3TestCaseV2[];
    isPublic: boolean;
}
