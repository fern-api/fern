import type * as SeedApi from "../../../index.mjs";
export interface V2TestCaseV2 {
    metadata: SeedApi.trace.V2TestCaseMetadata;
    implementation: SeedApi.trace.V2TestCaseImplementationReference;
    arguments: Record<string, SeedApi.trace.VariableValue>;
    expects?: (SeedApi.trace.V2TestCaseExpects | null) | undefined;
}
