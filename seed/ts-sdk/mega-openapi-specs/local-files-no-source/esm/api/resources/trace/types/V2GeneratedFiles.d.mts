import type * as SeedApi from "../../../index.mjs";
export interface V2GeneratedFiles {
    generatedTestCaseFiles: Record<string, SeedApi.trace.V2Files>;
    generatedTemplateFiles: Record<string, SeedApi.trace.V2Files>;
    other: Record<string, SeedApi.trace.V2Files>;
}
