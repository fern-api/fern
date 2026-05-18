import type * as SeedApi from "../../../index.mjs";
export interface PlaylistCreateRequest {
    name: string;
    problems: SeedApi.trace.ProblemId[];
}
