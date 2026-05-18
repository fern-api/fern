import type * as SeedApi from "../../../index.mjs";
export interface V2TestCaseMetadata {
    id: SeedApi.trace.V2TestCaseId;
    name: string;
    hidden: boolean;
}
