import type * as SeedApi from "../../../index.mjs";
export interface WorkspaceRunDetails {
    exceptionV2?: (SeedApi.trace.ExceptionV2 | null) | undefined;
    exception?: (SeedApi.trace.ExceptionInfo | null) | undefined;
    stdout: string;
}
