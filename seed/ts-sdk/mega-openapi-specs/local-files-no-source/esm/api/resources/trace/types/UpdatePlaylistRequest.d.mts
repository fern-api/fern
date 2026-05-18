import type * as SeedApi from "../../../index.mjs";
export interface UpdatePlaylistRequest {
    name: string;
    /** The problems that make up the playlist. */
    problems: SeedApi.trace.ProblemId[];
}
