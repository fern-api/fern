import { type StatusGeneration, type StatusPatch, type StatusResult, status } from "@fern-api/replay";

export type { StatusGeneration, StatusPatch, StatusResult };

export interface ReplayStatusParams {
    /** Directory containing the SDK (where .fern/replay.lock lives) */
    outputDir: string;
}

export function replayStatus(params: ReplayStatusParams): StatusResult {
    return status(params.outputDir);
}
