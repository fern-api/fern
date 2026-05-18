import type * as SeedApi from "../../../index.js";
export interface UpdatePlaylistRequest {
    name: string;
    /** The problems that make up the playlist. */
    problems: SeedApi.trace.ProblemId[];
}
