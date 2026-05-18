import type * as SeedApi from "../../../index.js";
export interface V2V3TestCaseV2 {
    metadata: SeedApi.trace.V2V3TestCaseMetadata;
    implementation: SeedApi.trace.V2V3TestCaseImplementationReference;
    arguments: Record<string, SeedApi.trace.VariableValue>;
    expects?: (SeedApi.trace.V2V3TestCaseExpects | null) | undefined;
}
