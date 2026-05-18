import type * as SeedApi from "../../../index.js";
export interface V2TestCaseMetadata {
    id: SeedApi.trace.V2TestCaseId;
    name: string;
    hidden: boolean;
}
