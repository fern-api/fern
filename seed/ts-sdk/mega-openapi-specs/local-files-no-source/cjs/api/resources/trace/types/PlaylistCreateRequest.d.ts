import type * as SeedApi from "../../../index.js";
export interface PlaylistCreateRequest {
    name: string;
    problems: SeedApi.trace.ProblemId[];
}
